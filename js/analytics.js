(function () {
  "use strict";

  // --- CONFIG ---
  // Same-origin by default: the tracking API is served from /api via a
  // Netlify Function, so no absolute host is needed (and none should be
  // hardcoded — localhost never resolves for real visitors).
  var API = window.__ANALYTICS_API || "";
  var SITE = "gebze-fiber-tamir";
  var SESSION_KEY = "_gft_session";
  var HEARTBEAT_INTERVAL = 15000; // 15s
  // -------------

  // Generate or retrieve session ID
  function getSession() {
    var id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = SITE + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  var sessionId = getSession();
  var pageStart = Date.now();
  var heartbeatTimer = null;

  // Get UTM params from URL
  function getUtmParams() {
    var p = new URLSearchParams(window.location.search);
    var params = {};
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].forEach(function (k) {
      var v = p.get(k);
      if (v) params[k] = v;
    });
    return params;
  }

  // Send POST to API
  function send(endpoint, data) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", API + "/api" + endpoint, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    } catch (e) {
      // silently fail — analytics should never break the page
    }
  }

  // Track page view
  function trackView() {
    var utm = getUtmParams();
    var ref = document.referrer || "";
    send("/track/view", {
      session_id: sessionId,
      path: window.location.pathname,
      title: document.title,
      referrer: ref,
      referrer_domain: ref ? (function(u){try{return new URL(u).hostname.replace("www.","")}catch(e){return null}})(ref) : null,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_content: utm.utm_content || null,
      utm_term: utm.utm_term || null
    });
  }

  // Send heartbeat (time on page)
  function startHeartbeat() {
    heartbeatTimer = setInterval(function () {
      var elapsed = Math.floor((Date.now() - pageStart) / 1000);
      send("/track/heartbeat", {
        session_id: sessionId,
        path: window.location.pathname,
        seconds: elapsed
      });
    }, HEARTBEAT_INTERVAL);
  }

  // Track clicks on phone / WhatsApp links
  function trackClicks() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("a");
      if (!el) return;

      var href = el.getAttribute("href") || "";
      var type = null;

      if (href.startsWith("tel:") || href.includes("tel:")) {
        type = "phone";
      } else if (href.includes("wa.me") || href.includes("whatsapp.com") || el.classList.contains("btn-wa")) {
        type = "whatsapp";
      }

      if (type) {
        var page = window.location.pathname;
        var utm = getUtmParams();
        send("/track/click", {
          session_id: sessionId,
          type: type,
          page: page,
          utm_source: utm.utm_source || null,
          utm_medium: utm.utm_medium || null,
          utm_campaign: utm.utm_campaign || null
        });
      }
    });
  }

  // Track page leave
  function trackLeave() {
    var elapsed = Math.floor((Date.now() - pageStart) / 1000);
    // Use sendBeacon for reliable last ping
    var utm = getUtmParams();
    var payload = JSON.stringify({
      session_id: sessionId,
      path: window.location.pathname,
      seconds: elapsed
    });
    try {
      navigator.sendBeacon(API + "/api/track/heartbeat", payload);
    } catch (e) {}
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  }

  // Init
  trackView();
  startHeartbeat();
  trackClicks();
  window.addEventListener("beforeunload", trackLeave);
  window.addEventListener("pagehide", trackLeave);

  // SPA support — re-track on History API changes
  var origPushState = history.pushState;
  history.pushState = function () {
    origPushState.apply(this, arguments);
    setTimeout(function () {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      pageStart = Date.now();
      trackView();
      startHeartbeat();
    }, 100);
  };
  window.addEventListener("popstate", function () {
    setTimeout(function () {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      pageStart = Date.now();
      trackView();
      startHeartbeat();
    }, 100);
  });
})();
