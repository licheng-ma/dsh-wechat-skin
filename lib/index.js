/**
 * dsh-wechat-skin — host half.
 *
 * Intentionally a no-op loader entry: the whole feature lives in the browser
 * half (`./client`), which DSH's dsh-client-modules picks up through the
 * package's `dsh.client` declaration — the same shape as the shipped ui-*
 * packages and dsh-dream-skin.
 *
 * Persistence lives in localStorage (key `dsh-wechat-skin:enabled`): the Host
 * settings wire only exposes allowlisted namespaces to browser clients, and a
 * purely visual preference matches that boundary while surviving reloads.
 */

/** Host loader entry for the browser implementation exported from `./client`. */
export function apply() {}
