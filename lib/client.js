// dsh-wechat-skin — browser half (client plugin bundle) — v3.
//
// Loaded by dsh-client-modules at /plugins/dsh-wechat-skin/client.js and
// executed through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load), the same shape as dsh-dream-skin and the
// shipped ui-* packages.
//
// How it works:
//  - Tokens: ctx.theme.overrideTokens layer carries the WeChat palette for the
//    LIGHT color scheme only; dark values are the DSH built-in dark defaults,
//    so dark mode looks exactly like stock DSH.
//  - Structure: one injected <style> tag scoped to body.dsh-wechat-skin-on
//    (class toggled by JS, only while the resolved theme is light).
//  - Avatars: 100 embedded avatars (50 real portraits + 50 cartoon), shuffled
//    and assigned per conversation row (persisted in localStorage by title),
//    plus fixed user / assistant avatars for message bubbles.
//  - Subtitles: the plugin progressively records each opened conversation's
//    last message (localStorage) and renders it as the row's second line.
//  - Composer: drag the bottom edge to resize the input area (persisted).
//  - Persistence: localStorage key `dsh-wechat-skin:enabled`; enabled by
//    default on first load (auto-apply), toggle in Settings → General.

window.__ModuleLoader__.load({
	id: "dsh-wechat-skin",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _react = require("react");
		let _runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

		//#region dsh-wechat-skin: constants
		/** Settings row locale namespace. */
		const SETTINGS_NS = "settings.wechatSkin";
		/** localStorage keys. */
		const STORAGE_KEY = "dsh-wechat-skin:enabled";
		const AVATAR_MAP_KEY = "dsh-wechat-skin:avatar-map";
		const SUBTITLE_MAP_KEY = "dsh-wechat-skin:subtitle-map";
		const COMPOSER_H_KEY = "dsh-wechat-skin:composer-height";
		/** Source identity for the token override layer. */
		const OVERRIDE_SOURCE = "dsh-wechat-skin:tokens";
		/** <style> tag id for the structural stylesheet. */
		const STYLE_TAG_ID = "dsh-wechat-skin:css";
		/** Body class that gates every structural rule (light mode only). */
		const BODY_CLASS = "dsh-wechat-skin-on";
		/** Subtitle preview length limit. */
		const SUBTITLE_MAX = 40;
		/** Fixed avatar indices for message bubbles (user / assistant). */
		const USER_AVATAR_INDEX = 25;
		const ASSISTANT_AVATAR_INDEX = 5;
		/** localStorage keys for custom (user-uploaded) avatars. */
		const USER_AVATAR_KEY = "dsh-wechat-skin:user-avatar";
		/** localStorage key for the far-left rail configuration. */
		const RAIL_KEY = "dsh-wechat-skin:rail";
		/** localStorage key for the font-size level (1..5, default 3 = middle). */
		const FONT_LEVEL_KEY = "dsh-wechat-skin:font-level";
		/** Font-size scale per level; level 3 = 1.0 (the original size). */
		const FONT_SCALES = { 1: 0.8, 2: 0.9, 3: 1.0, 4: 1.1, 5: 1.25 };
		/** Default rail selection (up to 6). */
		const DEFAULT_RAIL = ["new", "settings", "appearance", "models", "plugins", "workspace"];
		/** Catalog of functions selectable for the far-left rail (gray line icons). */
		const RAIL_CATALOG = [
			{ id: "new", label: "新会话", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>' },
			{ id: "settings", label: "设置", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2.2"/><path d="M8 1.6v1.8M8 12.6v1.8M1.6 8h1.8M12.6 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3"/></svg>' },
			{ id: "appearance", label: "外观", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2a6 6 0 1 0 0 12c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H12a2 2 0 0 0 2-2V5a3 3 0 0 0-6-3z"/></svg>' },
			{ id: "models", label: "模型", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M8 1.5v2.5M8 12v2.5M1.5 8H4M12 8h2.5M6 6h4v4H6z"/></svg>' },
			{ id: "plugins", label: "插件", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2h4v4H3zM9 10h4v4H9zM5 6h2a2 2 0 0 0 0 4H5"/></svg>' },
			{ id: "workspace", label: "工作区", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h3A1.5 1.5 0 0 1 8 3.5V14H3.5A1.5 1.5 0 0 1 2 12.5V3.5zM8 7h5.5A1.5 1.5 0 0 1 15 8.5v4a1.5 1.5 0 0 1-1.5 1.5H8V7z"/></svg>' },
			{ id: "about", label: "关于", icon: '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="8" cy="8" r="6.2"/><path d="M8 7.4v3.2M8 5.2v.2"/></svg>' }
		];
		/** WeChat palette accents. */
		const WECHAT_GREEN = "#07c160";
		const WECHAT_GREEN_HOVER = "#06ad56";

		/** Embedded avatar pool (filled at build time). */
		const AVATARS = [];

		/**
		 * Token override layer. `light` carries the WeChat palette; `dark`
		 * carries the DSH built-in dark values (design-platform.css dark block)
		 * so the override layer is a no-op in dark mode.
		 */
		const TOKEN_OVERRIDES = {
			"--dsw-alias-state-business-primary": { light: WECHAT_GREEN, dark: "rgb(86, 134, 254)" },
			"--dsw-alias-state-business-tertiary": { light: "#e8f7ee", dark: "rgb(52, 65, 91)" },
			"--dsw-alias-state-success-primary": { light: WECHAT_GREEN, dark: "rgb(34, 197, 94)" },
			"--dsw-alias-button-info-fill": { light: WECHAT_GREEN, dark: "rgb(86, 134, 254)" },
			"--dsw-alias-button-info-hover": { light: WECHAT_GREEN_HOVER, dark: "rgb(65, 118, 230)" },
			"--dsw-alias-brand-primary": { light: WECHAT_GREEN, dark: "rgb(235, 238, 242)" },
			"--dsw-alias-brand-text": { light: "#ffffff", dark: "rgb(235, 238, 242)" },
			"--dsw-alias-interactive-bg-hover": { light: "rgba(0, 0, 0, 0.05)", dark: "rgba(255, 255, 255, 0.08)" },
			"--dsw-alias-interactive-bg-active": { light: "rgba(0, 0, 0, 0.08)", dark: "rgba(255, 255, 255, 0.14)" },
			"--dsw-alias-interactive-bg-hover-accent": { light: "rgba(7, 193, 96, 0.10)", dark: "rgba(255, 255, 255, 0.24)" },
			"--dsw-specific-sidebar-fill": { light: "#e6e6e8", dark: "rgb(21, 21, 23)" },
			"--dsw-specific-bubble": { light: "#95ec69", dark: "rgb(33, 33, 35)" },
			"--dsw-alias-bg-module-platform": { light: "#f2f2f2", dark: "rgb(53, 54, 56)" },
			"--dsw-alias-bg-overlay": { light: "#ffffff", dark: "rgb(67, 69, 74)" },
			"--dsw-alias-scrollbar-bg-l1": { light: "#e1e1e1", dark: "rgb(60, 60, 61)" },
			"--dsw-alias-scrollbar-bg-l2": { light: "#e1e1e1", dark: "rgb(84, 85, 87)" },
			"--dsw-alias-scrollbar-hover-l1": { light: "#cccccc", dark: "rgb(84, 85, 87)" },
			"--dsw-alias-scrollbar-hover-l2": { light: "#cccccc", dark: "rgb(101, 103, 107)" }
		};

		/**
		 * Structural stylesheet (kept in sync with wechat-skin.css at build).
		 */
		const WECHAT_CSS = `
/* dsh-wechat-skin structural stylesheet — v4.
   Every rule is gated by body.dsh-wechat-skin-on (toggled by the plugin only
   while the resolved theme is light); selectors raise specificity over the
   shipped hashed-class rules. Kept in sync with WECHAT_CSS in lib/client.js. */

/* ---- token overrides ---- */
body.dsh-wechat-skin-on {
  --dsw-alias-state-business-primary: #07c160 !important;
  --dsw-alias-state-business-tertiary: #e8f7ee !important;
  --dsw-alias-state-success-primary: #07c160 !important;
  --dsw-alias-button-info-fill: #07c160 !important;
  --dsw-alias-button-info-hover: #06ad56 !important;
  --dsw-alias-brand-primary: #07c160 !important;
  --dsw-alias-brand-text: #ffffff !important;
  --dsw-alias-interactive-bg-hover: rgba(0, 0, 0, 0.05) !important;
  --dsw-alias-interactive-bg-active: rgba(0, 0, 0, 0.08) !important;
  --dsw-alias-interactive-bg-hover-accent: rgba(7, 193, 96, 0.10) !important;
  --dsw-specific-sidebar-fill: #e6e6e8 !important;
  --dsw-specific-bubble: #95ec69 !important;
  --dsw-alias-bg-module-platform: #f2f2f2 !important;
  --dsw-alias-bg-overlay: #ffffff !important;
  --dsw-alias-scrollbar-bg-l1: #e1e1e1 !important;
  --dsw-alias-scrollbar-bg-l2: #e1e1e1 !important;
  --dsw-alias-scrollbar-hover-l1: #cccccc !important;
  --dsw-alias-scrollbar-hover-l2: #cccccc !important;
}

/* ---- chat wallpaper: WeChat flat light gray (#F8F8F8) ---- */
body.dsh-wechat-skin-on .Md3f7G_scroll {
  background-color: #f8f8f8;
}
/* v5: message column spans the same width as the full-width input box,
   so avatars align to the input box's left/right edges. */
body.dsh-wechat-skin-on .Md3f7G_scroll {
  padding: 16px 8px;
}
body.dsh-wechat-skin-on .Md3f7G_column {
  max-width: none;
  width: 100%;
}

/* ---- WeChat font + unified 15px text ---- */
body.dsh-wechat-skin-on .Md3f7G_column,
body.dsh-wechat-skin-on .Sxvs8a_root,
body.dsh-wechat-skin-on .gdEzaW_bubble,
body.dsh-wechat-skin-on .YDXeBa_sessionRow {
  font-family: "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif;
}

/* ---- WeChat-style time divider ---- */
body.dsh-wechat-skin-on .FJxK0a_root {
  color: #b2b2b2;
  font-size: 11px;
}

/* ================= message bubbles + avatars ================= */

/* user bubble: right-aligned WeChat green, 8px radius + tail */
body.dsh-wechat-skin-on .gdEzaW_userRow .gdEzaW_bubble {
  background: #95ec69;
  color: #101010;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: calc(15px * var(--dsh-wechat-font-scale, 1));
  font-weight: 400;
  line-height: calc(23px * var(--dsh-wechat-font-scale, 1));
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.03);
  position: relative;
}
body.dsh-wechat-skin-on .gdEzaW_userRow .gdEzaW_bubble::before {
  content: "";
  position: absolute;
  top: 11px;
  right: -7px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 7px;
  border-color: transparent transparent transparent #95ec69;
}

/* user message avatar (right side) */
body.dsh-wechat-skin-on [data-chat-flow-kind="user"],
body.dsh-wechat-skin-on [data-chat-flow-kind="steering"] {
  position: relative;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="user"] .gdEzaW_userRow,
body.dsh-wechat-skin-on [data-chat-flow-kind="steering"] .gdEzaW_userRow {
  margin-right: 48px;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="user"]::after,
body.dsh-wechat-skin-on [data-chat-flow-kind="steering"]::after {
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-image: var(--dsh-user-avatar, linear-gradient(135deg, #ffb37b, #f97316));
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* assistant message: left-aligned white bubble, 8px radius + tail */
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root {
  background: #ffffff;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.03);
  width: fit-content;
  max-width: min(82%, 620px);
  position: relative;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root::before {
  content: "";
  position: absolute;
  top: 11px;
  left: -7px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 7px 6px 0;
  border-color: transparent #ffffff transparent transparent;
}
/* assistant message avatar (left side) */
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] {
  position: relative;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root {
  margin-left: 48px;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"]::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-image: var(--dsh-assistant-avatar, linear-gradient(135deg, #6db7ff, #3b82f6));
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_actions {
  margin-left: -2px;
}

/* ---- v5: flatten ALL assistant text to 15px regular (no bold, no size diff) ---- */
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root,
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root * {
  font-weight: 400 !important;
  font-size: calc(15px * var(--dsh-wechat-font-scale, 1)) !important;
  line-height: calc(24px * var(--dsh-wechat-font-scale, 1)) !important;
  text-align: left;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root pre,
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root code,
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root kbd,
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .Sxvs8a_root samp {
  font-family: var(--ds-font-family-code, Consolas, monospace) !important;
  font-size: calc(13px * var(--dsh-wechat-font-scale, 1)) !important;
  font-weight: 400 !important;
}

/* reasoning rows INSIDE the assistant bubble: quiet gray pill */
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .QWLzlG_root {
  background: rgba(0, 0, 0, 0.035);
  border-radius: 6px;
  padding: 2px 8px;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .QWLzlG_summary,
body.dsh-wechat-skin-on [data-chat-flow-kind="assistant-step"] .QWLzlG_thinkBody {
  font-size: 12px !important;
}

/* command / tool-call rows: soft translucent chips */
body.dsh-wechat-skin-on [data-chat-flow-kind="command"] ._Xvjua_root {
  background: rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  padding: 2px 10px;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="tool-call"] .ztWv_q_callRow {
  background: rgba(255, 255, 255, 0.55);
  border-radius: 8px;
  padding: 2px 8px;
}
body.dsh-wechat-skin-on [data-chat-flow-kind="tool-call"] .o3BgMG_row,
body.dsh-wechat-skin-on [data-chat-flow-kind="tool-call"] .o3BgMG_summary {
  font-size: 12px;
}

/* ================= header ================= */
body.dsh-wechat-skin-on .wSkVaW_header {
  background: #ffffff;
  padding-top: 14px;
}
body.dsh-wechat-skin-on .wSkVaW_tab {
  font-size: 13px;
}
body.dsh-wechat-skin-on .wSkVaW_headerActions {
  opacity: 0.85;
  font-size: 12px;
}

/* ================= hero (new conversation): default DSH look (starfield reverted) ================= */

/* ================= composer (WeChat full-width bordered rounded input) ================= */
body.dsh-wechat-skin-on .uV2eYG_root {
  padding: 0;
}
body.dsh-wechat-skin-on .uV2eYG_card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: none;
  max-width: none;
  width: calc(100% - 16px);
  margin: 0 8px 8px;
}
body.dsh-wechat-skin-on .uV2eYG_card .uV2eYG_scroll {
  flex: 1;
}
/* subtle drag grip at the card bottom edge */
body.dsh-wechat-skin-on .uV2eYG_card::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 3px;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.08);
  pointer-events: none;
}
body.dsh-wechat-skin-on .uV2eYG_add {
  background: #f2f2f2;
}
body.dsh-wechat-skin-on .uV2eYG_select {
  background-color: #f2f2f2;
  border-radius: 8px;
}
/* send button: WeChat rectangle with 发送 text (gray empty / green with text) */
body.dsh-wechat-skin-on .uV2eYG_primary {
  width: auto;
  height: 30px;
  min-width: 68px;
  padding: 0 16px;
  border-radius: 5px;
  transform: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #9b9b9b;
  font-size: 14px;
}
body.dsh-wechat-skin-on .uV2eYG_primary::after {
  content: "发送";
}
body.dsh-wechat-skin-on .uV2eYG_primary svg {
  display: none;
}
body.dsh-wechat-skin-on .uV2eYG_card:has(.uV2eYG_input:not(:placeholder-shown)) .uV2eYG_primary {
  background: #07c160;
  color: #ffffff;
}
body.dsh-wechat-skin-on .uV2eYG_card:has(.uV2eYG_input:not(:placeholder-shown)) .uV2eYG_primary:hover {
  background: #06ad56;
}

/* ================= sidebar: WeChat conversation list ================= */
body.dsh-wechat-skin-on .hHd-Xa_root {
  background: #e6e6e8;
}
body.dsh-wechat-skin-on .hHd-Xa_newSession {
  border-radius: 8px;
  border-color: transparent;
  background: #ffffff;
}

/* session rows: two-line rows, 40px rounded-square photo avatars (aligned) */
body.dsh-wechat-skin-on .YDXeBa_sessionRow {
  height: auto;
  min-height: 44px;
  border-radius: 8px;
  padding: 2px 10px;
  margin: 1px 0;
  flex-wrap: wrap;
  position: relative;
  align-content: center;
}
body.dsh-wechat-skin-on .YDXeBa_sessionRow:hover {
  background: rgba(0, 0, 0, 0.045);
}
/* avatar: rounded-square photo (assigned per row via --dsh-avatar), 40px */
body.dsh-wechat-skin-on .YDXeBa_sessionRow .YDXeBa_slot {
  order: 1;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background-image: var(--dsh-avatar, linear-gradient(145deg, #58c98e, #2fae6d));
  background-size: cover;
  background-position: center;
  color: #ffffff;
  flex: none;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
body.dsh-wechat-skin-on .YDXeBa_sessionRow .YDXeBa_slot svg {
  display: none;
}
/* name on line 1: smaller + regular (no bold, per v5) */
body.dsh-wechat-skin-on .YDXeBa_sessionRow .YDXeBa_title {
  order: 2;
  flex: 1;
  min-width: 0;
  font-size: calc(15px * var(--dsh-wechat-font-scale, 1));
  font-weight: 400;
  line-height: 18px;
  color: #191919;
}
/* time: smaller + lighter, top-right */
body.dsh-wechat-skin-on .YDXeBa_sessionRow .YDXeBa_time {
  order: 3;
  font-size: 10px;
  line-height: 18px;
  color: #b2b2b2;
}
/* status dot */
body.dsh-wechat-skin-on .YDXeBa_sessionRow .YDXeBa_dot {
  order: 4;
}
/* subtitle line 2: filled by the plugin via data-dsh-subtitle */
body.dsh-wechat-skin-on .YDXeBa_sessionRow::after {
  content: attr(data-dsh-subtitle);
  order: 5;
  width: 100%;
  padding-left: 46px;
  font-size: calc(11px * var(--dsh-wechat-font-scale, 1));
  line-height: 14px;
  color: #9f9fa6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
body.dsh-wechat-skin-on .YDXeBa_sessionRow:not([data-dsh-subtitle])::after {
  display: none;
}
/* hover actions stay overlaid top-right */
body.dsh-wechat-skin-on .YDXeBa_sessionRow:hover .YDXeBa_rowActions {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
}
/* selected row: solid WeChat green (#15AC70) + white text */
body.dsh-wechat-skin-on .YDXeBa_sessionRow.YDXeBa_selected,
body.dsh-wechat-skin-on .YDXeBa_sessionRow.YDXeBa_selected:hover {
  background: #15ac70;
}
body.dsh-wechat-skin-on .YDXeBa_sessionRow.YDXeBa_selected .YDXeBa_title,
body.dsh-wechat-skin-on .YDXeBa_sessionRow.YDXeBa_selected .YDXeBa_time,
body.dsh-wechat-skin-on .YDXeBa_sessionRow.YDXeBa_selected::after {
  color: #ffffff;
}

/* ================= far-left gray rail (injected by the plugin) ================= */
body.dsh-wechat-skin-on .pI_x6G_frame {
  margin-left: 56px;
}
#dsh-wechat-rail {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 56px;
  z-index: 60;
  background: #dedee4;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 6px;
  overflow-y: auto;
}
#dsh-wechat-rail .dsh-rail-avatar {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: none;
  padding: 0;
  cursor: pointer;
  background-image: var(--dsh-user-avatar, linear-gradient(135deg, #ffb37b, #f97316));
  background-size: cover;
  background-position: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  margin-bottom: 6px;
}
#dsh-wechat-rail .dsh-rail-btn {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: none;
  padding: 0;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 17px;
  line-height: 1;
  color: #555555;
  background: transparent;
}
#dsh-wechat-rail .dsh-rail-btn:hover {
  background: rgba(0, 0, 0, 0.07);
}
#dsh-wechat-rail .dsh-rail-btn:active {
  background: rgba(0, 0, 0, 0.12);
}

/* ---- details panel: keep white ---- */
body.dsh-wechat-skin-on .ydkMvW_root {
  background: #ffffff;
}

`;

		//#endregion

		//#region dsh-wechat-skin: persistence + DOM helpers
		/** Read the enabled flag; absent flag means enabled (auto-apply). */
		function readEnabled() {
			const value = window.localStorage.getItem(STORAGE_KEY);
			if (value === null) return true;
			return value !== "0";
		}
		/** Persist the enabled flag. */
		function writeEnabled(on) {
			window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
		}
		/** Read a JSON value from localStorage (fallback on absence/error). */
		function readJson(key, fallback) {
			try {
				const value = window.localStorage.getItem(key);
				return value === null ? fallback : JSON.parse(value);
			} catch (e) { return fallback; }
		}
		/** Write a JSON value to localStorage. */
		function writeJson(key, value) {
			try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
		}
		/** Fisher–Yates shuffle (returns a new array). */
		function shuffle(array) {
			const a = array.slice();
			for (let i = a.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[a[i], a[j]] = [a[j], a[i]];
			}
			return a;
		}
		/** Inject the structural stylesheet once. */
		function ensureStyleTag() {
			if (document.getElementById(STYLE_TAG_ID)) return;
			const tag = document.createElement("style");
			tag.id = STYLE_TAG_ID;
			tag.textContent = WECHAT_CSS;
			document.head.appendChild(tag);
		}
		/** Remove the structural stylesheet. */
		function removeStyleTag() {
			const tag = document.getElementById(STYLE_TAG_ID);
			if (tag) tag.remove();
		}
		//#endregion

		//#region dsh-wechat-skin: avatars + subtitles + composer (DOM enhancement)
		let avatarMap = readJson(AVATAR_MAP_KEY, {});
		let subtitleMap = readJson(SUBTITLE_MAP_KEY, {});

		/** Deterministic avatar index from a title — stable across reloads. */
		function avatarIndexForTitle(title) {
			let hash = 0;
			for (let i = 0; i < title.length; i++) {
				hash = (hash * 31 + title.codePointAt(i)) >>> 0;
			}
			return AVATARS.length > 0 ? hash % AVATARS.length : hash;
		}

		/** XML-escape a character for embedding in a generated SVG avatar. */
		function escapeXml(ch) {
			return ch.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]));
		}

		/** Generate a deterministic colored-initial SVG avatar (no third-party photos). */
		function generatedAvatar(title, seed) {
			const hue = (seed * 47 + 15) % 360;
			const initial = escapeXml(Array.from(title.trim())[0] || "?");
			const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">'
				+ '<rect width="128" height="128" rx="14" fill="hsl(' + hue + ',55%,58%)"/>'
				+ '<text x="64" y="86" font-size="60" text-anchor="middle" fill="#ffffff" font-family="Microsoft YaHei, Segoe UI, sans-serif">' + initial + '</text></svg>';
			return "data:image/svg+xml," + encodeURIComponent(svg);
		}

		/** Resolve an avatar for an index: photo from the pool, or a generated one. */
		function avatarForIndex(title, index) {
			if (AVATARS.length > 0 && index < AVATARS.length) return AVATARS[index];
			return generatedAvatar(title, index);
		}

		/** Session title of a sidebar row. */
		function titleOf(row) {
			const el = row.querySelector(".YDXeBa_title");
			return el ? el.textContent.trim() : "";
		}

		/** Assign (and persist) a stable avatar to one session row. */
		function assignRowAvatar(row, title) {
			if (avatarMap[title] === undefined) {
				avatarMap[title] = avatarIndexForTitle(title);
				writeJson(AVATAR_MAP_KEY, avatarMap);
			}
			row.style.setProperty("--dsh-avatar", "url(\"" + avatarForIndex(title, avatarMap[title]) + "\")");
		}

		/** Render the recorded subtitle for one session row. */
		function fillSubtitle(row, title) {
			const preview = subtitleMap[title];
			if (preview) row.setAttribute("data-dsh-subtitle", preview);
			else row.removeAttribute("data-dsh-subtitle");
		}

		/** Set the message-bubble avatars. User = uploaded/default; assistant = active session's avatar. */
		function ensureMessageAvatars() {
			const root = document.documentElement;
			const userAvatar = window.localStorage.getItem(USER_AVATAR_KEY) || avatarForIndex("me", USER_AVATAR_INDEX);
			root.style.setProperty("--dsh-user-avatar", "url(\"" + userAvatar + "\")");
			syncAssistantAvatar();
		}

		/** Make the assistant (left) avatar match the active session's sidebar avatar. */
		function syncAssistantAvatar() {
			const activeRow = document.querySelector('.YDXeBa_sessionRow[aria-selected="true"]');
			const title = activeRow ? titleOf(activeRow) : "";
			const index = (title && avatarMap[title] !== undefined)
				? avatarMap[title]
				: (title ? avatarIndexForTitle(title) : ASSISTANT_AVATAR_INDEX);
			document.documentElement.style.setProperty("--dsh-assistant-avatar", "url(\"" + avatarForIndex(title, index) + "\")");
		}

		/** Downscale an uploaded image to a small JPEG data URL (≤128px). */
		function downscaleImage(file, max = 128) {
			return new Promise((resolve, reject) => {
				const url = URL.createObjectURL(file);
				const img = new Image();
				img.onload = () => {
					const scale = Math.min(1, max / Math.max(img.width, img.height));
					const canvas = document.createElement("canvas");
					canvas.width = Math.max(1, Math.round(img.width * scale));
					canvas.height = Math.max(1, Math.round(img.height * scale));
					const ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					URL.revokeObjectURL(url);
					resolve(canvas.toDataURL("image/jpeg", 0.82));
				};
				img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
				img.src = url;
			});
		}

		/** Set a custom user avatar (persisted + applied). */
		function setUserAvatar(dataUrl) {
			try { window.localStorage.setItem(USER_AVATAR_KEY, dataUrl); } catch (e) {}
			document.documentElement.style.setProperty("--dsh-user-avatar", "url(\"" + dataUrl + "\")");
		}

		//#region far-left gray rail
		/** Click the first element matching a selector. */
		function click(selector) {
			const el = document.querySelector(selector);
			if (el) el.click();
			return !!el;
		}
		/** Open the Settings page (best-effort button discovery). */
		function openSettings() {
			if (click(".hHd-Xa_settingsArea button")) return;
			const candidates = document.querySelectorAll("button");
			for (const el of candidates) {
				const text = (el.textContent || "").trim();
				if (text === "设置" || text === "Settings" || text.includes("设置")) { el.click(); return; }
			}
		}
		/** Open Settings, then try to deep-link a section by its visible label. */
		function openSettingsThen(...labels) {
			openSettings();
			setTimeout(() => {
				const candidates = document.querySelectorAll("button, [role=tab], a, [role=menuitem]");
				for (const el of candidates) {
					const text = (el.textContent || "").trim();
					if (text && labels.some((label) => text === label || text.startsWith(label))) { el.click(); return; }
				}
			}, 450);
		}
		/** Execute a rail function by id. */
		function railAction(id) {
			switch (id) {
				case "new": click(".hHd-Xa_newSession"); break;
				case "settings": openSettings(); break;
				case "appearance": openSettingsThen("外观", "Theme", "主题"); break;
				case "models": openSettingsThen("模型", "Model"); break;
				case "plugins": openSettingsThen("插件", "Plugin"); break;
				case "workspace": openSettingsThen("工作区", "Workspace"); break;
				case "about": openSettingsThen("关于", "About"); break;
				default: break;
			}
		}
		/** Open a file picker and apply the chosen photo as the user avatar. */
		function uploadUserAvatarViaPicker() {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.style.display = "none";
			input.addEventListener("change", () => {
				const file = input.files && input.files[0];
				if (file) downscaleImage(file).then(setUserAvatar).catch(() => {});
				input.remove();
			});
			document.body.appendChild(input);
			input.click();
		}
		/** Re-render the rail from the current configuration. */
		function syncRail() {
			const rail = document.getElementById("dsh-wechat-rail");
			if (!rail) return;
			let avatar = rail.querySelector(".dsh-rail-avatar");
			if (!avatar) {
				avatar = document.createElement("button");
				avatar.className = "dsh-rail-avatar";
				avatar.title = "上传头像";
				avatar.addEventListener("click", uploadUserAvatarViaPicker);
				rail.appendChild(avatar);
			}
			const config = readJson(RAIL_KEY, DEFAULT_RAIL);
			const ids = Array.isArray(config) ? config.slice(0, 6) : DEFAULT_RAIL;
			const buttons = [...rail.querySelectorAll(".dsh-rail-btn")];
			ids.forEach((id, index) => {
				const item = RAIL_CATALOG.find((candidate) => candidate.id === id);
				if (!item) return;
				let button = buttons[index];
				if (!button) {
					button = document.createElement("button");
					button.className = "dsh-rail-btn";
					rail.appendChild(button);
				}
				button.dataset.railId = id;
				button.title = item.label;
				button.innerHTML = item.icon;
				button.onclick = () => railAction(id);
			});
			while (rail.querySelectorAll(".dsh-rail-btn").length > ids.length) {
				const last = rail.querySelector(".dsh-rail-btn:last-of-type");
				if (last) last.remove();
			}
		}
		/** Inject the far-left rail once (part of the skin). */
		function ensureRail() {
			if (!document.getElementById("dsh-wechat-rail")) {
				const rail = document.createElement("div");
				rail.id = "dsh-wechat-rail";
				document.body.appendChild(rail);
			}
			syncRail();
		}
		/** Remove the far-left rail. */
		function removeRail() {
			document.getElementById("dsh-wechat-rail")?.remove();
		}
		//#endregion

		/** Record the active conversation's last message as its row subtitle. */
		function captureLastMessage() {
			const column = document.querySelector(".Md3f7G_column");
			const activeRow = document.querySelector('.YDXeBa_sessionRow[aria-selected="true"]');
			if (!column || !activeRow) return;
			const title = titleOf(activeRow);
			if (!title) return;
			const items = column.querySelectorAll(".Md3f7G_flowItem");
			let last = null;
			for (const item of items) {
				const kind = item.getAttribute("data-chat-flow-kind");
				if (kind === "user" || kind === "steering") {
					const bubble = item.querySelector(".gdEzaW_bubble");
					if (bubble) {
						const text = bubble.textContent.replace(/\s+/g, " ").trim();
						if (text) last = text;
					}
				} else if (kind === "assistant-step") {
					const root = item.querySelector(".Sxvs8a_root");
					if (root) {
						const text = root.textContent.replace(/\s+/g, " ").trim();
						if (text) last = text;
					}
				}
			}
			if (!last) return;
			const chars = Array.from(last);
			const preview = chars.length > SUBTITLE_MAX ? chars.slice(0, SUBTITLE_MAX).join("") + "…" : last;
			if (subtitleMap[title] !== preview) {
				subtitleMap[title] = preview;
				writeJson(SUBTITLE_MAP_KEY, subtitleMap);
				activeRow.setAttribute("data-dsh-subtitle", preview);
			}
		}

		/** Composer drag-to-resize via document-level delegation (survives re-renders).
		    Drag the input box's TOP border up, or its BOTTOM border down, to resize. */
		function initComposerResize() {
			const root = document.documentElement;
			if (root.dataset.dshResizeDelegated) return;
			root.dataset.dshResizeDelegated = "1";

			let dragging = false;
			let fromTop = false;
			let startY = 0;
			let startH = 0;

			const applyHeight = (card, height) => {
				card.style.height = height + "px";
				card.style.setProperty("--dsh-composer-text-max-height", Math.max(40, height - 64) + "px");
				writeJson(COMPOSER_H_KEY, height);
			};

			// restore the persisted height whenever a card appears
			const restoreHeight = () => {
				const card = document.querySelector(".uV2eYG_card");
				if (!card || card.dataset.dshHeightRestored) return;
				const savedHeight = readJson(COMPOSER_H_KEY, null);
				if (typeof savedHeight === "number" && savedHeight >= 64) applyHeight(card, savedHeight);
				card.dataset.dshHeightRestored = "1";
			};

			document.addEventListener("pointerdown", (event) => {
				const card = document.querySelector(".uV2eYG_card");
				if (!card) return;
				if (event.target.closest && event.target.closest("button, select, input, a, textarea")) return;
				const rect = card.getBoundingClientRect();
				const atTop = event.clientY >= rect.top - 8 && event.clientY <= rect.top + 10;
				const atBottom = event.clientY >= rect.bottom - 10 && event.clientY <= rect.bottom + 8;
				if (!atTop && !atBottom) return;
				dragging = true;
				fromTop = atTop;
				startY = event.clientY;
				startH = rect.height;
				event.preventDefault();
				document.body.style.cursor = "ns-resize";
			});

			document.addEventListener("pointermove", (event) => {
				if (!dragging) return;
				const card = document.querySelector(".uV2eYG_card");
				if (!card) return;
				const delta = fromTop ? (startY - event.clientY) : (event.clientY - startY);
				const height = Math.min(Math.max(startH + delta, 64), Math.round(window.innerHeight * 0.6));
				applyHeight(card, height);
			});

			document.addEventListener("pointerup", () => {
				dragging = false;
				document.body.style.cursor = "";
			});

			restoreHeight();
		}

		/** Debounced full DOM enhancement pass. */
		let scheduled = null;
		function scheduleScan() {
			if (scheduled) return;
			scheduled = requestAnimationFrame(() => {
				scheduled = null;
				scanRows();
				ensureMessageAvatars();
				initComposerResize();
				ensureRail();
				captureLastMessage();
			});
		}
		/** Assign avatars + subtitles to all visible session rows. */
		function scanRows() {
			const rows = document.querySelectorAll(".YDXeBa_sessionRow");
			for (const row of rows) {
				const title = titleOf(row);
				if (!title) continue;
				assignRowAvatar(row, title);
				fillSubtitle(row, title);
			}
		}
		//#endregion

		//#region dsh-wechat-skin: settings row store
		/** Apply the selected font-size level as a CSS scale variable. */
		function applyFontLevel(level) {
			const scale = FONT_SCALES[level] !== undefined ? FONT_SCALES[level] : FONT_SCALES[3];
			document.documentElement.style.setProperty("--dsh-wechat-font-scale", String(scale));
		}

		/** Toggle row slot store: enabled flag + rail selection + font level. */
		function createStore(initialRail, initialFontLevel) {
			return (0, _runtime_client.defineStore)({
				init: () => ({ enabled: true, rail: initialRail, fontLevel: initialFontLevel, revision: -1 }),
				actions: {
					sync: (d, enabled, rail, fontLevel, revision) => {
						if (revision <= d.revision) return;
						d.enabled = enabled;
						d.rail = rail;
						d.fontLevel = fontLevel;
						d.revision = revision;
					}
				}
			});
		}

		/** Inline styles for the toggle row (dependency-free). */
		const styles = {
			group: {
				borderBottom: "1px solid var(--dsw-alias-border-l2)",
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				padding: "16px 0"
			},
			title: {
				color: "var(--dsw-alias-label-primary)",
				fontSize: "14px",
				fontWeight: 500,
				lineHeight: "22px"
			},
			desc: {
				color: "var(--dsw-alias-label-tertiary)",
				fontSize: "12px",
				lineHeight: "18px"
			},
			button: {
				alignSelf: "flex-start",
				cursor: "pointer",
				border: "none",
				borderRadius: "8px",
				padding: "6px 14px",
				fontSize: "13px",
				lineHeight: "20px",
				fontWeight: 500,
				color: "#ffffff",
				background: WECHAT_GREEN
			},
			buttonOff: {
				alignSelf: "flex-start",
				cursor: "pointer",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "8px",
				padding: "6px 14px",
				fontSize: "13px",
				lineHeight: "20px",
				fontWeight: 500,
				color: "var(--dsw-alias-label-secondary)",
				background: "var(--dsw-alias-bg-module-platform)"
			},
			smallButton: {
				cursor: "pointer",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "8px",
				padding: "5px 12px",
				fontSize: "12px",
				lineHeight: "18px",
				color: "var(--dsw-alias-label-secondary)",
				background: "var(--dsw-alias-bg-module-platform)"
			},
			row: {
				display: "flex",
				alignItems: "center",
				gap: "8px"
			},
			chips: {
				display: "flex",
				flexWrap: "wrap",
				gap: "6px"
			},
			chip: {
				cursor: "pointer",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "14px",
				padding: "2px 10px",
				fontSize: "12px",
				lineHeight: "20px",
				color: "var(--dsw-alias-label-secondary)",
				background: "var(--dsw-alias-bg-module-platform)"
			},
			chipOn: {
				cursor: "pointer",
				border: "1px solid " + WECHAT_GREEN,
				borderRadius: "14px",
				padding: "2px 10px",
				fontSize: "12px",
				lineHeight: "20px",
				color: WECHAT_GREEN,
				background: "rgba(7, 193, 96, 0.08)"
			},
			fontBtn: {
				cursor: "pointer",
				border: "1px solid var(--dsw-alias-border-l2)",
				borderRadius: "8px",
				minWidth: "34px",
				height: "30px",
				padding: "0 8px",
				color: "var(--dsw-alias-label-secondary)",
				background: "var(--dsw-alias-bg-module-platform)"
			},
			fontBtnOn: {
				cursor: "pointer",
				border: "1px solid " + WECHAT_GREEN,
				borderRadius: "8px",
				minWidth: "34px",
				height: "30px",
				padding: "0 8px",
				color: WECHAT_GREEN,
				background: "rgba(7, 193, 96, 0.08)"
			}
		};

		/**
		 * The settings row: toggle + user avatar upload + font size + rail function selection.
		 * @param props - composed Settings slot props (t, toggle, setRail, setFontLevel, uploadUserAvatar, useStore).
		 */
		function WechatSkinRow({ t, toggle, setRail, setFontLevel, uploadUserAvatar, useStore }) {
			const enabled = useStore((s) => s.enabled);
			const rail = useStore((s) => s.rail);
			const fontLevel = useStore((s) => s.fontLevel);
			const userRef = (0, _react.useRef)(null);
			const onFile = (ref, action) => (event) => {
				const file = event.target.files && event.target.files[0];
				if (file) downscaleImage(file).then(action).catch(() => {});
				event.target.value = "";
			};
			const toggleRailItem = (id) => {
				const next = rail.includes(id) ? rail.filter((candidate) => candidate !== id) : [...rail, id];
				setRail(next.slice(0, 6));
			};
			const FONT_LABELS = ["小", "较小", "标准", "较大", "大"];
			return (0, react_jsx_runtime.jsxs)("div", {
				style: styles.group,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.desc,
						children: t("description")
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => toggle(!enabled),
						style: enabled ? styles.button : styles.buttonOff,
						children: t(enabled ? "disable" : "enable")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("fontTitle")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.row,
						children: FONT_LABELS.map((label, index) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setFontLevel(index + 1),
							style: fontLevel === index + 1 ? styles.fontBtnOn : styles.fontBtn,
							children: label
						}, "font-" + (index + 1)))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("avatarTitle")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.row,
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								ref: userRef,
								type: "file",
								accept: "image/*",
								style: { display: "none" },
								onChange: onFile(userRef, uploadUserAvatar)
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								style: styles.smallButton,
								onClick: () => userRef.current && userRef.current.click(),
								children: t("uploadUser")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						style: styles.title,
						children: t("railTitle")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						style: styles.chips,
						children: RAIL_CATALOG.map((item) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => toggleRailItem(item.id),
							style: rail.includes(item.id) ? styles.chipOn : styles.chip,
							children: t("rail." + item.id)
						}, item.id))
					})
				]
			});
		}
		//#endregion

		//#region dsh-wechat-skin: client plugin body
		/** Required services: theme runtime (token override), slots/locale. */
		const inject = [
			"slots",
			"locale",
			"theme"
		];

		/**
		 * Client plugin body.
		 * @param ctx - client cordis context.
		 */
		function apply(ctx) {
			let enabled = readEnabled();
			let disposeTokens = null;
			let observer = null;

			/** Add/remove the gating body class per (enabled, resolved scheme). */
			const syncBodyClass = () => {
				const dark = document.body ? document.body.hasAttribute("data-ds-dark-theme") : false;
				if (enabled && !dark) document.body.classList.add(BODY_CLASS);
				else document.body.classList.remove(BODY_CLASS);
			};

			/** Apply the current state: token layer + stylesheet + body class + rail. */
			const applyState = () => {
				if (enabled) {
					if (!disposeTokens) {
						disposeTokens = ctx.theme.overrideTokens(OVERRIDE_SOURCE, TOKEN_OVERRIDES);
					}
					ensureStyleTag();
					ensureRail();
				} else {
					if (disposeTokens) {
						disposeTokens();
						disposeTokens = null;
					}
					removeStyleTag();
					removeRail();
				}
				syncBodyClass();
			};

			// Keep the body class in sync when the resolved theme switches
			// light <-> dark, and enhance the DOM (avatars/subtitles/composer).
			ctx.on("theme/change", syncBodyClass);
			if (typeof MutationObserver !== "undefined" && document.body) {
				observer = new MutationObserver(scheduleScan);
				observer.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["aria-selected", "data-ds-dark-theme"]
				});
			}

			applyState();
			scheduleScan();

			// Settings row bookkeeping.
			let railConfig = readJson(RAIL_KEY, DEFAULT_RAIL);
			if (!Array.isArray(railConfig)) railConfig = DEFAULT_RAIL;
			let fontLevel = Number(readJson(FONT_LEVEL_KEY, 3));
			if (!(fontLevel >= 1 && fontLevel <= 5)) fontLevel = 3;
			applyFontLevel(fontLevel);
			const store = createStore(railConfig, fontLevel);
			let bound = null;
			let revision = 0;
			const sync = () => {
				bound?.sync(enabled, railConfig, fontLevel, ++revision);
			};
			const injected = (actions) => {
				bound = actions;
				sync();
				return {
					toggle: (on) => {
						enabled = !!on;
						writeEnabled(enabled);
						applyState();
						sync();
					},
					setRail: (ids) => {
						railConfig = Array.isArray(ids) ? ids.slice(0, 6) : DEFAULT_RAIL;
						writeJson(RAIL_KEY, railConfig);
						syncRail();
						sync();
					},
					setFontLevel: (level) => {
						fontLevel = (level >= 1 && level <= 5) ? level : 3;
						writeJson(FONT_LEVEL_KEY, fontLevel);
						applyFontLevel(fontLevel);
						sync();
					},
					uploadUserAvatar: (dataUrl) => {
						setUserAvatar(dataUrl);
					}
				};
			};

			ctx.effect(() => ctx.locale.register(SETTINGS_NS, {
				zh: {
					"title": "微信皮肤",
					"description": "仿微信 Windows 版浅色主题：绿色气泡、微信绿强调色、会话列表面板、100 张随机头像、最后消息副标题。深色模式下自动保持官方外观。",
					"enable": "启用微信皮肤",
					"disable": "停用微信皮肤（还原官方外观）",
					"avatarTitle": "头像",
					"uploadUser": "上传我的头像",
					"fontTitle": "字体大小（5 档）",
					"railTitle": "最左侧功能栏（最多 6 个）",
					"rail.new": "新会话",
					"rail.settings": "设置",
					"rail.appearance": "外观",
					"rail.models": "模型",
					"rail.plugins": "插件",
					"rail.workspace": "工作区",
					"rail.about": "关于"
				},
				en: {
					"title": "WeChat Skin",
					"description": "WeChat-style light theme: green bubbles, WeChat green accents, conversation-list sidebar, random avatars, last-message subtitles. Dark mode keeps the official look.",
					"enable": "Enable WeChat skin",
					"disable": "Disable WeChat skin (restore official look)",
					"avatarTitle": "Avatars",
					"uploadUser": "Upload my avatar",
					"fontTitle": "Font size (5 levels)",
					"railTitle": "Left rail functions (max 6)",
					"rail.new": "New session",
					"rail.settings": "Settings",
					"rail.appearance": "Appearance",
					"rail.models": "Models",
					"rail.plugins": "Plugins",
					"rail.workspace": "Workspace",
					"rail.about": "About"
				}
			}), "dsh-wechat-skin: settings row dictionaries");

			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "wechat-skin",
				order: 20,
				store,
				locale: SETTINGS_NS,
				inject: injected
			}, WechatSkinRow));

			ctx.effect(() => () => {
				if (disposeTokens) disposeTokens();
				removeStyleTag();
				document.body?.classList.remove(BODY_CLASS);
				observer?.disconnect();
			}, "dsh-wechat-skin: cleanup");
		}
		//#endregion

		exports.SETTINGS_NS = SETTINGS_NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
