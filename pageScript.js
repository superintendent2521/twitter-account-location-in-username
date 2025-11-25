// This script runs in the page context to access cookies and make API calls
(function() {
  // Store headers from Twitter's own API calls
  let twitterHeaders = null;
  let headersReady = false;
  
  // Function to capture headers from a request
  function captureHeaders(headers) {
    if (!headers) return;
    
    const headerObj = {};
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        headerObj[key.toLowerCase()] = value;
      });
    } else if (headers instanceof Object) {
      // Copy all headers
      for (const [key, value] of Object.entries(headers)) {
        headerObj[String(key).toLowerCase()] = value;
      }
    }
    
    // Replace headers completely (don't merge) to ensure we get auth tokens
    twitterHeaders = headerObj;
    headersReady = true;
    console.log('Captured Twitter API headers:', Object.keys(headerObj));
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function getDefaultHeaders() {
    const ct0 = getCookie('ct0');
    const guestToken = getCookie('gt');
    return {
      'accept': 'application/json',
      'content-type': 'application/json',
      'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAgNsv4q2y1wAAAAAAOVkkpLomqKgkl0vvVh2wVSaTwA',
      ...(ct0 ? { 'x-csrf-token': ct0 } : {}),
      ...(guestToken ? { 'x-guest-token': guestToken } : {}),
      'x-twitter-active-user': 'yes'
    };
  }
  
  // Intercept fetch to capture Twitter's headers
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [input, init = {}] = args;
    const url = typeof input === 'string' ? input : (input && input.url);
    
    // If it's a Twitter GraphQL API call, capture ALL headers
    if (typeof url === 'string' && url.includes('/i/api/graphql')) {
      const headersToCapture = init.headers || (input instanceof Request ? input.headers : undefined);
      if (headersToCapture) {
        captureHeaders(headersToCapture);
        console.log('Captured Twitter headers:', Object.keys(twitterHeaders || {}));
      }
    }
    
    return originalFetch.apply(this, [input, init]);
  };
  
  // Also intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._url = url;
    return originalXHROpen.apply(this, [method, url, ...rest]);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    if (this._url && this._url.includes('x.com/i/api/graphql')) {
      const headers = {};
      // Try to get headers from setRequestHeader
      if (this._headers) {
        Object.assign(headers, this._headers);
      }
      captureHeaders(headers);
    }
    return originalXHRSend.apply(this, args);
  };
  
  const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
    if (!this._headers) this._headers = {};
    this._headers[header] = value;
    return originalSetRequestHeader.apply(this, [header, value]);
  };
  
  // Wait a bit for Twitter to make some API calls first
  setTimeout(() => {
    if (!headersReady) {
      console.log('No Twitter headers captured yet, using defaults');
      twitterHeaders = getDefaultHeaders();
      headersReady = true;
    }
  }, 3000);
  
  // Listen for fetch requests from content script via postMessage
  window.addEventListener('message', async function(event) {
    // Only accept messages from our extension
    if (event.data && event.data.type === '__fetchLocation') {
      const { screenName, requestId } = event.data;
      
      // Wait for headers to be ready
      if (!headersReady) {
        let waitCount = 0;
        while (!headersReady && waitCount < 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          waitCount++;
        }
      }
      
      try {
        const variables = JSON.stringify({ screenName });
        const url = `https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery?variables=${encodeURIComponent(variables)}`;
        
        // Use captured headers or minimal defaults
        const headers = twitterHeaders || getDefaultHeaders();
        
        // Ensure credentials are included
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: headers,
          referrer: window.location.href,
          referrerPolicy: 'origin-when-cross-origin'
        });
        
        let location = null;
        if (response.ok) {
          const data = await response.json();
          console.log(`API response for ${screenName}:`, data);
          location = data?.data?.user_result_by_screen_name?.result?.about_profile?.account_based_in || null;
          console.log(`Extracted location for ${screenName}:`, location);
          
          // Debug: log the full path to see what's available
          if (!location && data?.data?.user_result_by_screen_name?.result) {
            console.log('User result available but no location:', {
              hasAboutProfile: !!data.data.user_result_by_screen_name.result.about_profile,
              aboutProfile: data.data.user_result_by_screen_name.result.about_profile
            });
          }
        } else {
          const errorText = await response.text().catch(() => '');
          
          // Handle rate limiting
          if (response.status === 429) {
            const resetTime = response.headers.get('x-rate-limit-reset');
            const remaining = response.headers.get('x-rate-limit-remaining');
            const limit = response.headers.get('x-rate-limit-limit');
            
            if (resetTime) {
              const resetDate = new Date(parseInt(resetTime) * 1000);
              const now = Date.now();
              const waitTime = resetDate.getTime() - now;
              
              console.log(`Rate limited! Limit: ${limit}, Remaining: ${remaining}`);
              console.log(`Rate limit resets at: ${resetDate.toLocaleString()}`);
              console.log(`Waiting ${Math.ceil(waitTime / 1000 / 60)} minutes before retrying...`);
              
              // Store rate limit info for content script
              window.postMessage({
                type: '__rateLimitInfo',
                resetTime: parseInt(resetTime),
                waitTime: Math.max(0, waitTime)
              }, '*');
            }
          } else {
            console.log(`Twitter API error for ${screenName}:`, response.status, response.statusText, errorText.substring(0, 200));
          }
        }
        
        // Send response back to content script via postMessage
        // Include error status so content script knows not to cache on rate limit
        window.postMessage({
          type: '__locationResponse',
          screenName,
          location,
          requestId,
          isRateLimited: response.status === 429
        }, '*');
      } catch (error) {
        console.error('Error fetching location:', error);
        window.postMessage({
          type: '__locationResponse',
          screenName,
          location: null,
          requestId
        }, '*');
      }
    }
  });
})();

