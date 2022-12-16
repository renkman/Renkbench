"use strict";

import { createApiClient } from "../../../public/modules/apiClient.js";

describe("apiClient tests", function () {
    let createHttpClientMock = (expectedUri, response) => {
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
        expect(createApiClient).not.toBe(null);
    });

    it("apiClient is a function", function () {
        expect(createApiClient).toEqual(jasmine.any(Function));
    });

    it("apiClient.getWorkbench gets the workbench", async function () {
        let expected = { type: "workbench" };
        let httpClientMock = createHttpClientMock('api/windows/0', expected)

        let client = createApiClient(httpClientMock);
        let workbench = await client.getWorkbench();

        expect(workbench).not.toBe(null);
        expect(workbench).toBe(expected);
    });

    it("apiClient.getWindow gets a window", async function () {
        let expected = { type: "window" };
        let httpClientMock = createHttpClientMock('api/windows/500', expected)

        let client = createApiClient(httpClientMock);
        let window = await client.getWindow(500);

        expect(window).not.toBe(null);
        expect(window).toBe(expected);
    });
});