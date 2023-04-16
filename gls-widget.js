// GLS Parcelshops widget
let orderId = Shopify.checkout.order_id;

function findGlsPs() {
  var glsDiv = document.createElement("div");
  glsDiv.setAttribute(
    "style",
    "z-index: 9999999; position: fixed; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5);"
  );
  glsDiv.setAttribute("id", "gls_psd_widget");
  document.body.appendChild(glsDiv);

  glsDiv.addEventListener("click", function () {
    closeWidget();
  });

  let ctrcode = "CZ",
    language = "cs";
  if (document.getElementById("ctrcodeGls") != null) {
    // @ts-ignore
    ctrcode = document.getElementById("ctrcodeGls").value;
  }
  if (document.getElementById("lngGls") != null) {
    // @ts-ignore
    language = document.getElementById("lngGls").value;
  }
  var glsIframe = document.createElement("iframe");

  glsIframe.setAttribute(
    "style",
    "border: none; background-color: white; position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%); width: 97%; height: 97%; z-index: 99999999;  box-shadow: 0 0 6px #ccc;  "
  );
  glsIframe.setAttribute("id", "glsIframe");
  glsIframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
  glsIframe.setAttribute("allow", "geolocation");
  glsIframe.setAttribute(
    "src",
    "https://maps.gls-czech.cz?find=1&ctrcode=" + ctrcode + "&lng=" + language
  );
  glsIframe.setAttribute("tabindex", "-1");

  document.body.appendChild(glsIframe);
  glsIframe.focus();
  // @ts-ignore
  glsIframe.contentWindow.focus();

  // @ts-ignore
  var eventMethod = window.addEventListener
    ? "addEventListener"
    : "attachEvent";
  var eventer = window[eventMethod];
  var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

  eventer(messageEvent, function (e) {
    if (
      e.data["event_id"] === "closeWidget" ||
      e.data["event_id"] === "closeWidget"
    ) {
      closeWidget();
    }

    if (
      e.data["event_id"] === "ps_data_handover" ||
      e.data["event_id"] === "ps_data_handover"
    ) {
      let ps = e.data.parcelshop;
      let psGlsName = document.getElementById("psGlsName"),
        psGlsId = document.getElementById("psGlsId"),
        psGlsStreet = document.getElementById("psGlsStreet"),
        psGlsCountry = document.getElementById("psGlsCountry"),
        psGlsId1 = document.getElementById("psGlsId1"),
        psGlsZipAndCity = document.getElementById("psGlsZipAndCity");

      if (psGlsName != null) {
        psGlsName.innerHTML =
          "<a href='https://maps.gls-czech.cz?sid=" +
          ps.detail.pclshopid +
          "' target='_blank'>" +
          ps.detail.name +
          "</a>";
      }
      if (psGlsId != null) {
        // @ts-ignore
        psGlsId.value = ps.detail.pclshopid;
      }

      if (psGlsStreet != null) {
        psGlsStreet.innerHTML = ps.detail.address;
      }

      if (psGlsCountry != null) {
        psGlsCountry.innerHTML = ps.detail.ctrcode;
      }

      if (psGlsId1 != null) {
        psGlsId1.innerHTML = ps.detail.pclshopid;
      }

      if (psGlsZipAndCity != null) {
        psGlsZipAndCity.innerHTML = ps.detail.zipcode + ", " + ps.detail.city;
      }

      let glsObject = {
        orderId: orderId,
        psGlsName: ps.detail.name,
        psGlsId: ps.detail.pclshopid,
        psGlsStreet: ps.detail.address,
        psGlsZipAndCity: ps.detail.zipcode + ", " + ps.detail.city,
        psGlsCountry: ps.detail.ctrcode,
      };

      setCookie(`gls-${orderId}`, JSON.stringify(glsObject), 30);

      // updateOrder(glsObject);

      closeWidget(true);
    }
  });

  function closeWidget(selectedPs = false) {
    glsIframe.remove();
    glsDiv.remove();
    const input = document.getElementById("psGlsId");
    // @ts-ignore
    input.value = selectedPs;

    let event = new UIEvent("change", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    // @ts-ignore
    input.dispatchEvent(event);
  }
}

function updateOrder(object) {
  // @ts-ignore
  fetch("https://hook.eu1.make.com/kw98k6cuxo2xxg8xkwi13o1vh69s4f8m", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  })
    .then((response) => response.json())
    .then((response) => console.log(JSON.stringify(response)));
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkGlsPs() {
  let existingGlsPs = getCookie(`gls-${orderId}`);
  if (existingGlsPs != "") {
    let selectPS = document.getElementById("selectPS");
    selectPS.style.display = "none";
    existingGlsPs = JSON.parse(existingGlsPs);
    let psGlsName = document.getElementById("psGlsName"),
      psGlsId = document.getElementById("psGlsId"),
      psGlsStreet = document.getElementById("psGlsStreet"),
      psGlsCountry = document.getElementById("psGlsCountry"),
      psGlsId1 = document.getElementById("psGlsId1"),
      psGlsZipAndCity = document.getElementById("psGlsZipAndCity");
    if (psGlsName != null) {
      psGlsName.innerHTML = existingGlsPs.psGlsName;
      psGlsName.innerHTML =
        "<a href='https://maps.gls-czech.cz?sid=" +
        existingGlsPs.psGlsId +
        "' target='_blank'>" +
        existingGlsPs.psGlsName +
        "</a>";
    }
    if (psGlsId != null) {
      psGlsId.innerHTML = existingGlsPs.psGlsId;
    }
    if (psGlsStreet != null) {
      psGlsStreet.innerHTML = existingGlsPs.psGlsStreet;
    }
    if (psGlsCountry != null) {
      psGlsCountry.innerHTML = existingGlsPs.psGlsCountry;
    }
    if (psGlsId1 != null) {
      psGlsId1.innerHTML = existingGlsPs.psGlsId;
    }
    if (psGlsZipAndCity != null) {
      psGlsZipAndCity.innerHTML = existingGlsPs.psGlsZipAndCity;
    }
  }
}

checkGlsPs();
