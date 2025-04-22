import { DataTable, When } from '@qavajs/playwright-runner-adapter';
import { dataTable2Object, sendHttpRequest } from './utils/utils';
import { QavajsPlaywrightWorld } from './QavajsPlaywrightWorld';
import { MemoryValue } from './types';

export class GraphQl {
    method = 'POST';
    headers = {'Content-Type': 'application/json'}
    _query = '';
    _variables = {};
    data = {};

    private updateBody() {
        this.data = {query: this._query, variables: this._variables};
    };

    set query(query: string) {
        this._query = query;
        this.updateBody();
    };

    set variables(variables: string) {
        this._variables = JSON.parse(variables);
        this.updateBody();
    };
}

/**
 * Create request template and save it to memory
 * @param {string} method - should be named as one of the http methods (e.g. GET, POST, PUT, DELETE and etc.)
 *
 * @example
 * When I create 'GET' request 'request'
 */
When('I create {string} request {value}', function (method: string, key: MemoryValue) {
    key.set({ method });
});

/**
 * Create GraphQL request template and save it to memory
 * @example
 * When I create GraphQL request 'request'
 */
When('I create GraphQL request {value}', function (key: MemoryValue) {
    key.set(new GraphQl());
});

/**
 * Add data table of headers to request
 * @param {string} requestKey - memory key of request
 * @param {Array<[string, string]>} headersDataTable - key value headers
 *
 * @example
 * When I add headers to '$request':
 *   | Content-Type | application/json |
 */
When('I add headers to {value}:', async function (this: QavajsPlaywrightWorld, requestKey: MemoryValue, headersDataTable: DataTable) {
    const request = await requestKey.value();
    request.headers = Object.assign({}, request.headers, await dataTable2Object(this, headersDataTable));
});

/**
 * Add headers to request
 * @param {string} requestKey - memory key of request
 * @param {string} headersKey - memory key of headers that resolves to JS object
 *
 * @example
 * When I add '$headers' headers to '$request'
 */
When('I add {value} headers to {value}', async function (headersKey: MemoryValue, requestKey: MemoryValue) {
    const request = await requestKey.value();
    request.headers = Object.assign({}, request.headers, await headersKey.value());
});

/**
 * Add body to request
 * @param {string} requestKey - memory key of request
 * @param {string} body - body
 *
 * @example
 * When I add body to '$request':
 * """
 *  {
 *      "message": "qavajs"
 *  }
 * """
 */
When('I add body to {value}:', async function (this: QavajsPlaywrightWorld, requestKey: MemoryValue, body: string) {
    const request = await requestKey.value();
    request.data = await this.value(body);
});

/**
 * Add query or variables to GraphQL request.
 * @param {string} property - one of GraphQl specific properties "query" or "variables"
 * @param {string} requestKey - memory key of request
 * @param {string} valueString - multiline string to be set as GraphQl body value.
 *
 * @example
 * When I add query to GraphQL '$request':
 * """
 *    query {
 *      characters(page: 2, filter: { name: "rick" }) {
 *        results {
 *          name
 *           }
 *         }
 *      }
 **/
When('I add {gqlRequestProperty} to GraphQL {value}:', async function (property: string, requestKey: MemoryValue, valueString: string) {
    const request: any = await requestKey.value();
    request[property] = await this.value(valueString);
});

/**
 * Add form data body to request
 * @param {string} requestKey - memory key of request
 * @param {string} body - body
 *
 * @example
 * When I add body to '$request':
 *   | key      | value                    | filename | contentType      |
 *   | formKey  | formValue                |          | application/json |
 *   | otherKey | otherValue               |          | text/plain       |
 *   | fileKey  | $file('./path/file.png') | file.png | image/png        |
 */
When('I add form data body to {value}:', async function (this: QavajsPlaywrightWorld, requestKey: MemoryValue, dataTable: DataTable) {
    const request = await requestKey.value();
    const formData = new FormData();
    for (const record of dataTable.hashes()) {
        const key = await this.value(record.key);
        const value = await this.value(record.value);
        const fileName = await this.value(record.filename) ?? 'default';
        const type = await this.value(record.contentType);
        formData.append(key, new Blob([value], { type }), fileName);
    }
    request.data = formData;
});

/**
 * Add body to request
 * @param {string} requestKey - memory key of request
 * @param {string} body - body
 *
 * @example
 * When I add '$body' body to '$request'
 */
When('I add {value} body to {value}', async function (bodyKey: MemoryValue, requestKey: MemoryValue) {
    const request = await requestKey.value();
    request.data = await bodyKey.value();
});

/**
 * Add url to request
 * @param {string} requestKey - memory key of request
 * @param {string} url - url
 *
 * @example
 * When I add 'https://qavajs.github.io/' url to '$request'
 */
When('I add {value} url to {value}', async function (urlKey: MemoryValue, requestKey: MemoryValue) {
    const request = await requestKey.value();
    request.url = await urlKey.value();
});

/**
 * Send request and send response
 * @param {string} requestKey - memory key of request
 * @param {string} responseKey - memory key to save response
 *
 * @example
 * When I send '$request' request and save response as 'response'
 */
When('I send {value} request and save response as {value}', async function (this: QavajsPlaywrightWorld, requestKey: MemoryValue, responseKey: MemoryValue) {
    const request = await requestKey.value();
    const response = await sendHttpRequest(this, request.url, request);
    responseKey.set(response);
});

/**
 * MANDATORY STEP THAT SHOULD BE USED AFTER SENDING REQUEST
 * Parsing body in needed way and set in payload property
 *
 * @example
 * I parse "$response" body as "json"
 * I expect "$response.payload.foo" to equal "bar"
 *
 * @param response key of the remembered response
 * @param type response body parsing type (buffer|json|text)
 */
When('I parse {value} body as {bodyParsingType}', async function (responseKey: MemoryValue, type: string) {
    const response: any = await responseKey.value();
    response.payload = await response[type]();
});