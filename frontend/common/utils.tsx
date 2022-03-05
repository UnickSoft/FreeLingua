declare var require: any

function RequestUrl(page) {
    return navigator.userAgent != "ReactSnap" ?
        page :
        "http://localhost:1337" + page
}

export default RequestUrl;