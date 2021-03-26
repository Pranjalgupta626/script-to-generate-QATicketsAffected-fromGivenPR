// import { JQL_CONSTANTS } from '../constants/JQL_CONSTANTS'
const JQL_CONSTANTS = require('../constants/JQL_CONSTANTS')
const axios = require("axios");

jiraService = {};

jiraService.getReadyForQaTickets = async (endpoint_jira, auth_jira) => {
    return axios({
      method: "get",
      url: endpoint_jira,
      headers: { Authorization: auth_jira },
      params: {
        jql: JQL_CONSTANTS.FarmCareReadyForQAS19
      }
    })
      .then((res) => {
        return res.data.issues
      })
}

module.exports = jiraService;
