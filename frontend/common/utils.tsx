declare var require: any

function RequestUrl(page) {
    return navigator.userAgent != "ReactSnap" ?
        page :
        "https://freelingua.unick-soft.ru" + page
}

export default RequestUrl;