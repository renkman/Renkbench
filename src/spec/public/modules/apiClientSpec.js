"use strict";

import { apiClient } from "../../../public/modules/apiClient.js";

describe("apiClient tests", function () {
    let httpClientMock = (expectedUri, response) => {
        let getJson = uri =>
            new Promise((resolve, reject) => {
                if (uri === expectedUri)
                    resolve(response);
                else
                    reject("Error: " + uri + " does not match " + expectedUri);
            });

        return {
            getJson: getJson
        };
    };

    it("apiClient is not null", function () {
        expect(apiClient).not.toBe(null);
    });

    it("apiClient is a function", function () {
        expect(apiClient).toEqual(jasmine.any(Function));
    });

    it("apiClient.getWorkbench gets the workbench", function () {
        let expected = { type: "workbench" };
        let httpClientMockInstance = httpClientMock('api/windows/0', expected)

        let client = apiClient(httpClientMockInstance);
        client.getWorkbench().then(workbench => {      
            expect(workbench).not.toBe(null);
            expect(workbench).toBe(expected);
        });       
    });

    it("apiClient.getWindow gets a window", function () {
        let expected = { type: "window" };
        let httpClientMockInstance = httpClientMock('api/windows/500', expected)

        let client = apiClient(httpClientMockInstance);
        client.getWindow(500).then(window => {
            expect(window).not.toBe(null);
            expect(window).toBe(expected);
        });       
    });
});