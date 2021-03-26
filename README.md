# script-to-generate-QATicketsAffected-fromGivenPR

### Steps to run the script:

1) Git clone the repository and enter into it.
2) Run "yarn install" on terminal.
3) Copy the .env file into the project folder which you have reveived personally.
4) Run following command: node index.js < PR number >
5) After running the command you can see three output JSON files which will get created under "outputJSONfiles" folder.


### Output files explanation:

- output.json:  A JSON representation of all the Ready for QA tickets along with files changed associated with each of the ticket will be saved in this file [ticket -> associated files changed array].

- outputReverse.json: As the name suggests, a JSON representation of all the file changes along with tickets associated with each file changed will be saved in this file [file changed -> associated tickets array].

- ticketsAffectedByPR_< PR number >.json: As the name suggests, a JSON representation of all the tickets affected by the given PR number will be saved in this file. 
