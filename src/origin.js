// Host-specific origin resolution is independent of Firebase/dependencies.
export function resolvePublicOrigin(env){
 if(env.APP_ORIGIN)return env.APP_ORIGIN;
 if(!env.RENDER_EXTERNAL_HOSTNAME)return undefined;
 const host=env.RENDER_EXTERNAL_HOSTNAME;
 if(!/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]{0,251}[a-zA-Z0-9])?$/.test(host)||host.includes('..'))throw Error('Invalid deployment hostname.');
 return 'https://'+host;
}
