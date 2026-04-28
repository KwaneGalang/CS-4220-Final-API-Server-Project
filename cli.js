import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { searchFlow, showHistory } from './app.js';
/* CS 4220 Midterm - Building an CLI application using Node.js and Axios w/ the chosen API: 
 *
 * Written by: Kwane Galang, Alan Mai, Daniel Gomez, Nikole Cabrera, Marco Rodriguez
 * Website used for basic functions: https://javascript.info
 * Website used for Node.js functions: https://nodejs.dev
 * Website used for axios: https://www.npmjs.com/package/axios
 * Date: Apri; 27, 2026
 * Last Updated: May 10, 2026
 * 
 * An API Token is required to run the application, which is listed under the .env file.
 * If the .env file is missing and/or the user would like to use a token of their own, the steps below can be followed:
 * 
 * 1. Create a .env file in the main project folder
 * 
 * 2. Under the .env file, include: TMDB_BEARER_TOKEN=<your_token>
 * 
 * 3. The API token can be generated and used by creating an account on the TMDB website, copying the 'API Read Access Token'
 *    and replacing the <your_token> with the actual token
 * 
 * Below are the commands available in this application:
 * 
 * node cli.js search <your_keyword>
 * 
 * node cli.js history keywords
 * 
 * node cli.js --help
 * 
 * node cli.js --version
*/

yargs(hideBin(process.argv))
    // $0 expand the filename
    // <> indicates that a command is required
    // [] indicate that a flag is optional
    .usage('$0: Usage <command> [options]')

    // -----Search command-----
    .command(
        'search <keyword>',
        'Search for a movie via keyword',
        (yargs) => {
            yargs.positional('keyword', {
                describe: 'keyword to search movies',
                type: 'string'
            });
        },
        // handler function
        async (args) => {
            await searchFlow(args.keyword);
        }
    )

    // -----History command-----
    .command(
        'history <type>',
        'View search history',
        (yargs) => {
            yargs.positional('type', {
                describe: 'type of history',
                type: 'string',
                choices: ['keywords']
            });
        },
        async (args) => {
            if (args.type === 'keywords') {
                await showHistory();
            }
        }
    )

    .example('$0 search batman', 'Search for Batman movies')
    .example('$0 history keywords', 'View search history')

    .demandCommand(1, 'You must provide a valid command')
    .help()
    .argv;
