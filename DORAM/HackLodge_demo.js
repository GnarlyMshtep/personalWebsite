let formEl = document.getElementById("doramQueryForm");
let updateReportEl = document.getElementById("updateReport");
let selectEl = document.getElementById("rw-select");
console.log(formEl, updateReportEl);

const IP = "54.177.89.133";
const PORT = 8880;

let getQueryURL = (which_server)=>{
    return `http://${IP}:${PORT+which_server}/query`
}


const DORAM_PAYLOAD_MAX = 1<<30-1; 
const DORAM_ADDRESS_MAX = (1<<20)-1; 


selectEl.addEventListener('change', ()=>{

    if(selectEl.value === "read"){
    formEl.elements["payload"].style.display = "none";
    document.getElementById("payload-label").style.display = "none";
    }else{
        formEl.elements["payload"].style.display = "inline";
         document.getElementById("payload-label").style.display = "inline";
    }

});

formEl.addEventListener('submit', async(e)=>{
    e.preventDefault();

    const s1_x = Math.round(Math.random()*DORAM_PAYLOAD_MAX);
    const s2_x = Math.round(Math.random()*DORAM_PAYLOAD_MAX);
    const s3_x = formEl.elements["address"].value ^s1_x ^ s2_x
    console.log(s1_x, DORAM_PAYLOAD_MAX);

    const s1_y = Math.round(Math.random()*DORAM_PAYLOAD_MAX);
    const s2_y = Math.round(Math.random()*DORAM_PAYLOAD_MAX);
    const s3_y = (selectEl.value === "read"? Math.round(Math.random()*DORAM_PAYLOAD_MAX) : formEl.elements["payload"].value^ s1_y ^ s2_y) ;


    const s1_is_write= Math.round(Math.random());
    const s2_is_write= Math.round(Math.random());
    const s3_is_write= ( selectEl.value === "read"? 0 : 1) ^s1_is_write ^ s2_is_write



    if(selectEl.value === "write"){
        updateReportEl.textContent = `Here are the secret shares sent server1: {x: {${s3_x}, ${s2_x}}, y: {${s3_y}, ${s2_y}}, server2: {x: {${s1_x}, ${s3_x}}, y: {${s1_y}, ${s3_y}}} server3: {x: {${s2_x}, ${s1_x}} ,y: {${s2_y, s1_y}}}}`
    }else{
        updateReportEl.textContent = `Here are the secret shares sent server1: {x: {${s3_x}, ${s2_x}}}, server2: {x: {${s1_x}, ${s3_x}}} server3: {x: {${s2_x}, ${s1_x}}}`
    }
    //the randomness is not working right now

    const s1_raw_send = fetch(getQueryURL(1), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({x: 
            {prev: s1_x, next: s2_x}, y: {prev: s1_y, next: s2_y}, is_write: {prev: s1_is_write, next: s2_is_write}})
      });

       const s2_raw_send = fetch(getQueryURL(2), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({x: 
            {prev: s2_x, next: s3_x}, y: {prev: s2_y, next: s3_y}, is_write: {prev: s2_is_write, next: s3_is_write}})
      });

       const s3_raw_send = fetch(getQueryURL(3), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({x: 
            {prev: s3_x, next: s1_x}, y: {prev: s3_y, next: s1_y}, is_write: {prev: s3_is_write, next: s1_is_write}})
      });


        const all_res_raw = await Promise.all([s1_raw_send,s2_raw_send,s3_raw_send])
        const all_res = await Promise.all([all_res_raw[0].json(),all_res_raw[1].json(),all_res_raw[2].json()]) 

        console.log(all_res)

        const query_res = all_res[0].prev^all_res[0].next^ all_res[1].next
      
      updateReportEl.textContent = `Recieved from DORAM: ${query_res}`
})


