const jiraService = require('./services/jira')
const githubService = require('./services/github')
const fs = require('fs');
require('dotenv').config();

username_jira = process.env.USERNAME;
apikey_jira = process.env.APIKEY;
endpoint_jira = process.env.ENDPOINT;
username_git = process.env.USERNAME_GIT;
apikey_git = process.env.APIKEY_GIT;
endpoint_git = process.env.ENDPOINT_GIT;
console.log(username_jira)

const base64creds_jira = Buffer.from(username_jira + ":" + apikey_jira, "ascii").toString(
    "base64"
);
const base64creds_git = Buffer.from(username_git + ":" + apikey_git, "ascii").toString(
    "base64"
);
let auth_jira = "Basic " + base64creds_jira;
let auth_git = "Basic " + base64creds_git;
var currentSprint = 19;
var ticketStatus = "Ready for QA"
var tests = {};
var prToFilesChanged = {};
var qa_tests_reverse_final = {};
var ticketsAffectedFromGivenPR = [];
var finalResult = [];

const checkIfPrMerged = (prStatus) => {
    let prMergedStaus = JSON.stringify(prStatus).includes("state=MERGED")
        ? true : false
    return prMergedStaus
}

const saveJson = (qa_tests, filename) => {
    fs.writeFile(`./outputJSONfiles/${filename}`, JSON.stringify(qa_tests), "utf8", () => {
        console.log("")
    })
}

const fileChangedToTicketsJson = async (qa_tests, prNumber) => {
    var totalFilesChanged = []
    var qa_tests_reverse = {}
    var fileChangedToTicketsArray = {}
    qa_tests["tests"].forEach((test) => {
        if (totalFilesChanged.length === 0) {
            totalFilesChanged = test.files_changed
        }
        else {
            totalFilesChanged = totalFilesChanged.concat(test.files_changed)
        }
    })
    totalFilesChanged.forEach((fileChanged) => {
        qa_tests["tests"].forEach((test) => {
            if (test.files_changed.includes(fileChanged)) {
                if (!Object.keys(fileChangedToTicketsArray).includes(`test_${fileChanged}`)) {
                    fileChangedToTicketsArray[`test_${fileChanged}`] = {
                        filename: fileChanged,
                        tickets: [{
                            name: test.name,
                            ticket_name: test.ticket_name,
                            ticket_type: test.ticket_type,
                            epic: test.epic
                        }]
                    }
                }
                else {
                    if (fileChangedToTicketsArray[`test_${fileChanged}`].tickets.some((item) => item.ticket_name === test.ticket_name)) {

                    }
                    else {
                        fileChangedToTicketsArray[`test_${fileChanged}`].tickets = fileChangedToTicketsArray[`test_${fileChanged}`].tickets.concat({
                            name: test.name,
                            ticket_name: test.ticket_name,
                            ticket_type: test.ticket_type,
                            epic: test.epic
                        })
                    }
                }
            }
        })
    })
    qa_tests_reverse["tests"] = []
    Object.keys(fileChangedToTicketsArray).forEach((test) => {
        qa_tests_reverse["tests"].push(fileChangedToTicketsArray[`${test}`])
    })
    qa_tests_reverse_final = qa_tests_reverse
    let filesChangedRaw = await githubService.getFilesChangedOfaPRnumber(prNumber, auth_git)
    let filesChanged = filesChangedRaw.map((fileChanged) => fileChanged.filename)
    let finalResultJson = {}
    filesChanged.forEach((fileChanged) => {
        if(Object.keys(fileChangedToTicketsArray).includes(`test_${fileChanged}`)) {
            ticketsAffectedFromGivenPR.push(...(fileChangedToTicketsArray[`test_${fileChanged}`].tickets))
        }
    })
    ticketsAffectedFromGivenPR.forEach((test) => {
        if(!finalResult.some(obj => obj.ticket_name === test.ticket_name)) {
            finalResult.push(test)
        }
    })
    console.log(finalResult)
    finalResultJson[`ticketsAffectedByPR_${prNumber}`] = finalResult
    saveJson(finalResultJson, `ticketsAffectedByPR_${prNumber}.json`)
    saveJson(qa_tests_reverse, "outputReverse.json")
}

const main = async (prNumber) => {
    var qa_tests = {};
    let readyForQaTickets = await jiraService.getReadyForQaTickets(endpoint_jira, auth_jira)
    let readyForQaTicketsPRmerged = readyForQaTickets.filter((ticket) => checkIfPrMerged(ticket.fields.customfield_10000))
    readyForQaTicketsPRmerged.forEach(async (ticket, indx_ticket) => {
        let frontendPRs = await githubService.getFrontendPRsOfaTicket(ticket, auth_git)
        let backendPRs = await githubService.getBackendPRsOfaTicket(ticket, auth_git)
        let prsOfaTicket = frontendPRs.concat(backendPRs)
        if (prsOfaTicket && prsOfaTicket.length != 0) {
            prsOfaTicket.forEach(async (pr, indx_pr) => {
                let filesChangedRaw = await githubService.getFilesChangedOfaPR(pr, auth_git)
                let filesChanged = filesChangedRaw.map((fileChanged) => fileChanged.filename)
                prToFilesChanged[pr.number] = filesChanged
                if (!Object.keys(tests).includes(`test_${ticket.key}`)) {
                    tests[`test_${ticket.key}`] = {
                        name: ticket.fields.summary,
                        category: [],
                        ticket_name: ticket.key,
                        ticket_type: ticket.fields.issuetype.name,
                        epic: ticket.fields.parent?.fields.summary,
                        PR_number: [pr.number],
                        files_changed: filesChanged
                    }
                }
                else {
                    tests[`test_${ticket.key}`].PR_number.push(pr.number);
                    tests[`test_${ticket.key}`].files_changed = (tests[`test_${ticket.key}`].files_changed).concat(filesChanged);
                }
                qa_tests["tests"] = [];
                Object.keys(tests).forEach((test, indx_test) => {
                    qa_tests["tests"].push(tests[`${test}`])
                })
                saveJson(qa_tests, "output.json")
                fileChangedToTicketsJson(qa_tests, prNumber)
            })
        }
    })
}

if (process.argv.length == 2) {
    main()
}

else if (process.argv.length > 2) {
    main(process.argv[2])
}