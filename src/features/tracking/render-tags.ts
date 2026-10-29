import { escapeAttribute } from "../static-site-generator/content/html";
import { isValidTrackingId, type TrackingField, type TrackingSettings } from "./types";

const lineSeparators = new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g");

// A double-quoted JS string literal that is safe inside an inline <script>.
export function escapeJsString(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(lineSeparators, (char) => "\\u" + char.charCodeAt(0).toString(16));
}

function renderMeta(id: string): string {
  return `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${escapeJsString(id)});
fbq('track', 'PageView');
</script>`;
}

function renderGa4(id: string): string {
  const src = escapeAttribute(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);

  return `<script async src="${src}"></script>
<script>
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${escapeJsString(id)});
</script>`;
}

function renderTiktok(id: string): string {
  return `<script>
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.load(${escapeJsString(id)});
ttq.page();
}(window,document,'ttq');
</script>`;
}

function renderSnapchat(id: string): string {
  return `<script>
(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');
snaptr('init', ${escapeJsString(id)}, {});
snaptr('track', 'PAGE_VIEW');
</script>`;
}

function renderClarity(id: string): string {
  return `<script>
(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${escapeJsString(id)});
</script>`;
}

const renderers: Record<TrackingField, (id: string) => string> = {
  metaPixelId: renderMeta,
  ga4Id: renderGa4,
  tiktokPixelId: renderTiktok,
  snapPixelId: renderSnapchat,
  clarityId: renderClarity,
};

export function renderTags(settings: TrackingSettings): string {
  const snippets: string[] = [];

  for (const field of Object.keys(renderers) as TrackingField[]) {
    const id = settings[field];

    if (id !== undefined && isValidTrackingId(field, id)) {
      snippets.push(renderers[field](id));
    }
  }

  return snippets.join("\n");
}
