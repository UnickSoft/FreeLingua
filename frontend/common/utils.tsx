declare var require: any

function RequestUrl(page) {
    return navigator.userAgent != "ReactSnap" ?
        page :
        "https://freelingua.unick-soft.ru" + page
}

function IsLocalhost() {
    return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

export { RequestUrl, IsLocalhost };