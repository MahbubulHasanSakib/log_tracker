export const getRequestSourceData = (headers) => {
  const useragent = headers['user-agent'] ?? {};
  const platform = headers['sec-ch-ua-platform'] ?? 'unknown';

  const browser = getBrowser(useragent);

  return {
    browser,
    platform,
  };
};

export const getBrowser = (userAgent) => {
  let browser = 'unknown';
  // Detect browser name
  browser =
    /firefox|fxios/i.test(userAgent) && !/seamonkey/i.test(userAgent)
      ? 'Firefox'
      : browser;
  browser =
    /; msie|trident/i.test(userAgent) && !/ucbrowser/i.test(userAgent)
      ? 'IE'
      : browser;
  browser =
    /chrome|crios/i.test(userAgent) &&
    !/opr|opera|chromium|edg|ucbrowser|googlebot/i.test(userAgent)
      ? 'Chrome'
      : browser;
  browser =
    /safari/i.test(userAgent) &&
    !/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i.test(
      userAgent,
    )
      ? 'Safari'
      : browser;
  browser = /opr|opera/i.test(userAgent) ? 'Opera' : browser;

  // detect browser version
  switch (browser) {
    case 'Edge':
      return `${browser}/${browserVersion(
        userAgent,
        /(edge|edga|edgios|edg)\/([\d\.]+)/i,
      )}`;

    case 'Firefox':
      return `${browser}/${browserVersion(
        userAgent,
        /(firefox|fxios)\/([\d\.]+)/i,
      )}`;
    case 'Chrome':
      return `${browser}/${browserVersion(
        userAgent,
        /(chrome|crios)\/([\d\.]+)/i,
      )}`;
    case 'Safari':
      return `${browser}/${browserVersion(userAgent, /(safari)\/([\d\.]+)/i)}`;
    case 'Opera':
      return `${browser}/${browserVersion(
        userAgent,
        /(opera|opr)\/([\d\.]+)/i,
      )}`;
    case 'IE':
      const version = browserVersion(userAgent, /(trident)\/([\d\.]+)/i);
      // IE version is mapped using trident version
      // IE/8.0 = Trident/4.0, IE/9.0 = Trident/5.0
      return version
        ? `${browser}/${parseFloat(version) + 4.0}`
        : `${browser}/7.0`;
    default:
      return `unknown/0.0.0.0`;
  }
};

const browserVersion = (userAgent, regex) => {
  return userAgent.match(regex) ? userAgent.match(regex)[2] : null;
};
