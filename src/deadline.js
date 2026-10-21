// Bound the entire operation, including time waiting for a remote reply.
// A timed-out Redis write may still complete; callers fail closed and must not retry it.
export async function withDeadline(promise,milliseconds=3000){let timer;try{return await Promise.race([promise,new Promise((_resolve,reject)=>{timer=setTimeout(()=>reject(new Error('Dependency deadline exceeded.')),milliseconds);})]);}finally{clearTimeout(timer);}}
