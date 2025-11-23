# Twitter Account Location Flag Chrome Extension

A Chrome extension that displays country flag emojis next to Twitter/X usernames based on the account's location information.

## Features

- Automatically detects usernames on Twitter/X pages
- Queries Twitter's GraphQL API to get account location information
- Displays the corresponding country flag emoji next to usernames
- Hide posts/accounts originating from countries you select in the popup
- Works with dynamically loaded content (infinite scroll)
- Caches location data to minimize API calls

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the directory containing this extension
6. The extension will now be active on Twitter/X pages

## How It Works

1. The extension runs a content script on all Twitter/X pages
2. It identifies username elements in tweets and user profiles
3. For each username, it queries Twitter's GraphQL API endpoint (`AboutAccountQuery`) to get the account's location
4. The location is mapped to a flag emoji using the country flags mapping
5. The flag emoji is displayed next to the username

## Files

- `manifest.json` - Chrome extension configuration
- `content.js` - Main content script that processes the page and injects page scripts for API calls
- `countryFlags.js` - Country name to flag emoji mapping
- `README.md` - This file

## Technical Details

The extension uses a page script injection approach to make API requests. This allows it to:
- Access the same cookies and authentication as the logged-in user
- Make same-origin requests to Twitter's API without CORS issues
- Work seamlessly with Twitter's authentication system

The content script injects a script into the page context that listens for location fetch requests. When a username is detected, the content script sends a custom event to the page script, which makes the API request and returns the location data.

## Hiding posts from specific countries

Use the extension popup to manage the list of countries you want to hide:
1. Open the popup from the toolbar and scroll to **Hidden countries**
2. Type a country name (case-insensitive) and press **Add**. Suggestions are provided for the built-in country list.
3. Tweets and user cells whose profile location matches any selected country will be hidden once the location is fetched.
4. Use **Clear** to remove all filters or the x on a chip to remove a single country. Removing a country will unhide previously hidden posts.

## API Endpoint

The extension uses Twitter's GraphQL API endpoint:
```
https://x.com/i/api/graphql/XRqGa7EeokUU5kppkh13EA/AboutAccountQuery
```

With variables:
```json
{
  "screenName": "username"
}
```

The response contains `account_based_in` field in:
```
data.user_result_by_screen_name.result.about_profile.account_based_in
```

## Limitations

- Requires the user to be logged into Twitter/X
- Only works for accounts that have location information available
- Country names must match the mapping in `countryFlags.js` (case-insensitive)
- Rate limiting may apply if making too many requests

## Privacy

- The extension only queries public account information
- No data is stored or transmitted to third-party servers
- All API requests are made directly to Twitter/X servers
- Location data is cached locally in memory

## Troubleshooting

If flags are not appearing:
1. Make sure you're logged into Twitter/X
2. Check the browser console for any error messages
3. Verify that the account has location information available
4. Try refreshing the page

## License

MIT

