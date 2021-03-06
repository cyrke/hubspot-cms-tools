const request = require('request-promise-native');
const moment = require('moment');
const { getAndLoadConfigIfNeeded, getPortalConfig } = require('../lib/config');
const http = require('../http');
const { version } = require('../package.json');

jest.mock('request-promise-native', () => ({
  get: jest.fn().mockReturnValue(Promise.resolve()),
  post: jest.fn().mockReturnValue(Promise.resolve()),
}));
jest.mock('../lib/config');
jest.mock('../logger');

describe('http', () => {
  afterEach(() => {
    jest.clearAllMocks();
    getAndLoadConfigIfNeeded.mockReset();
    getPortalConfig.mockReset();
  });
  describe('getRequestOptions()', () => {
    it('constructs baseUrl as expected based on environment', () => {
      getAndLoadConfigIfNeeded.mockReturnValue({
        portals: [],
      });

      expect(http.getRequestOptions()).toMatchObject({
        baseUrl: 'https://api.hubapi.com',
      });
      expect(http.getRequestOptions({ env: 'QA' })).toMatchObject({
        baseUrl: 'https://api.hubapiqa.com',
      });
    });
    it('supports httpUseLocalhost config option to construct baseUrl for local HTTP services', () => {
      getAndLoadConfigIfNeeded.mockReturnValue({
        httpUseLocalhost: true,
        portals: [],
      });

      expect(http.getRequestOptions()).toMatchObject({
        baseUrl: 'https://local.hubapi.com',
      });
      expect(http.getRequestOptions({ env: 'QA' })).toMatchObject({
        baseUrl: 'https://local.hubapiqa.com',
      });
    });
  });
  describe('get()', () => {
    it('adds authorization header when using OAuth2 with valid access token', async () => {
      const accessToken = 'let-me-in';
      const portal = {
        id: 123,
        authType: 'oauth2',
        clientId: 'd996372f-2b53-30d3-9c3b-4fdde4bce3a2',
        clientSecret: 'f90a6248-fbc0-3b03-b0db-ec58c95e791',
        scopes: ['content'],
        tokenInfo: {
          expiresAt: moment()
            .add(2, 'hours')
            .toISOString(),
          refreshToken: '84d22710-4cb7-5581-ba05-35f9945e5e8e',
          accessToken,
        },
      };
      getAndLoadConfigIfNeeded.mockReturnValue({
        portals: [portal],
      });
      getPortalConfig.mockReturnValue(portal);
      await http.get(123, {
        uri: 'some/endpoint/path',
      });

      expect(request.get).toBeCalledWith({
        baseUrl: `https://api.hubapi.com`,
        uri: 'some/endpoint/path',
        headers: {
          'User-Agent': `HubSpot CMS Tools/${version}`,
          Authorization: `Bearer ${accessToken}`,
        },
        json: true,
        simple: true,
        timeout: 15000,
        qs: {
          portalId: 123,
        },
      });
    });

    it('supports setting a custom timeout', async () => {
      getAndLoadConfigIfNeeded.mockReturnValue({
        httpTimeout: 1000,
        portals: [
          {
            id: 123,
            apiKey: 'abc',
          },
        ],
      });
      getPortalConfig.mockReturnValue({
        id: 123,
        apiKey: 'abc',
      });

      await http.get(123, {
        uri: 'some/endpoint/path',
      });

      expect(request.get).toBeCalledWith({
        baseUrl: `https://api.hubapi.com`,
        uri: 'some/endpoint/path',
        headers: {
          'User-Agent': `HubSpot CMS Tools/${version}`,
        },
        json: true,
        simple: true,
        timeout: 1000,
        qs: {
          portalId: 123,
          hapikey: 'abc',
        },
      });
    });
  });
});
