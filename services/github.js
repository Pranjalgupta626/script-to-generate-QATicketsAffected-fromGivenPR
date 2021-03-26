const JQL_CONSTANTS = require('../constants/JQL_CONSTANTS')
const axios = require("axios");

githubService = {};

githubService.getFrontendPRsOfaTicket = async (ticket, auth_git) => {
    return axios({
        method: "get",
        url: `https://api.github.com/search/issues?q=is:pr+is:merged+repo:yaradigitallabs/sh-farmhealth-mobile+head:${ticket.fields.issuetype.name === "Bug" ?
            "fix/" : "feature/"}${ticket.key}`,
        headers: { Authorization: auth_git }
    })
        .then((res) => {
            return res.data.items
        })
}

githubService.getBackendPRsOfaTicket = async (ticket, auth_git) => {
    return axios({
        method: "get",
        url: `https://api.github.com/search/issues?q=is:pr+is:merged+repo:yaradigitallabs/sh-farmhealth-be+head:${ticket.fields.issuetype.name === "Bug" ?
            "fix/" : "feature/"}${ticket.key}`,
        headers: { Authorization: auth_git }
    })
        .then((res) => {
            return res.data.items
        })
}

githubService.getFilesChangedOfaPR = async (pullRequest, auth_git) => {
    return axios({
        method: "get",
        url: `https://api.github.com/repos/yaradigitallabs/sh-farmhealth-mobile/pulls/${pullRequest.number}/files`,
        headers: { Authorization: auth_git }
    })
        .then((res) => {
            return res.data
        }, (err) => { console.log(err) })
}

githubService.getFilesChangedOfaPRnumber = async (pullRequestNumber, auth_git) => {
    return axios({
        method: "get",
        url: `https://api.github.com/repos/yaradigitallabs/sh-farmhealth-mobile/pulls/${pullRequestNumber}/files`,
        headers: { Authorization: auth_git }
    })
        .then((res) => {
            return res.data
        }, (err) => { console.log(err) })
}

module.exports = githubService;
