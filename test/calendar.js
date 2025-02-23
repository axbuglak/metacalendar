/* eslint-disable max-len */
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { CalendarEvent } = require('..');

const ICS_DATA = `
   BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//Example Corp.//Example Client//EN
   BEGIN:VTIMEZONE
   LAST-MODIFIED:20040110T032845Z
   TZID:US/Eastern
   BEGIN:DAYLIGHT
   DTSTART:20000404T020000
   RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4
   TZNAME:EDT
   TZOFFSETFROM:-0500
   TZOFFSETTO:-0400
   END:DAYLIGHT
   BEGIN:STANDARD
   DTSTART:20001026T020000
   RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
   TZNAME:EST
   TZOFFSETFROM:-0400
   TZOFFSETTO:-0500
   END:STANDARD
   END:VTIMEZONE
   BEGIN:VEVENT
   DTSTAMP:20060206T001121Z
   DTSTART;TZID=US/Eastern:20060102T120000
   DURATION:PT1H
   RRULE:FREQ=DAILY;COUNT=5
   RDATE;TZID=US/Eastern;VALUE=PERIOD:20060102T150000/PT2H
   SUMMARY:Event #2
   DESCRIPTION:We are having a meeting all this week at 12 pm for one hour, with an additional
    meeting: on the first day 2 hours long. Please: bring your own lunch for the 12
    pm meetings.
   UID:00959BC664CA650E933C892C@example.com
   END:VEVENT
   BEGIN:VEVENT
   DTSTAMP:20060206T001121Z
   DTSTART;TZID=US/Eastern:20060104T140000
   DURATION:PT1H
   RECURRENCE-ID;TZID=US/Eastern:20060104T120000
   SUMMARY:Event #2 bis
   UID:00959BC664CA650E933C892C@example.com
   END:VEVENT
   END:VCALENDAR
`;

const JSON_DATA = `
{
  "VCALENDAR": [
    {
      "VERSION": "2.0",
      "PRODID": "-//Example Corp.//Example Client//EN",
      "VTIMEZONE": [
        {
          "LAST-MODIFIED": "20040110T032845Z",
          "TZID": "US/Eastern",
          "DAYLIGHT": [
            {
              "DTSTART": "20000404T020000",
              "RRULE": {
                "FREQ": "YEARLY",
                "BYDAY": "1SU",
                "BYMONTH": "4"
              },
              "TZNAME": "EDT",
              "TZOFFSETFROM": "-0500",
              "TZOFFSETTO": "-0400"
            }
          ],
          "STANDARD": [
            {
              "DTSTART": "20001026T020000",
              "RRULE": {
                "FREQ": "YEARLY",
                "BYDAY": "-1SU",
                "BYMONTH": "10"
              },
              "TZNAME": "EST",
              "TZOFFSETFROM": "-0400",
              "TZOFFSETTO": "-0500"
            }
          ]
        }
      ],
      "VEVENT": [
        {
          "DTSTAMP": "20060206T001121Z",
          "DTSTART": {
            "parameters": {
              "TZID": "US/Eastern"
            },
            "value": "20060102T120000"
          },
          "DURATION": "PT1H",
          "RRULE": {
            "FREQ": "DAILY",
            "COUNT": "5"
          },
          "RDATE": {
            "parameters": {
              "TZID": "US/Eastern",
              "VALUE": "PERIOD"
            },
            "value": "20060102T150000/PT2H"
          },
          "SUMMARY": "Event #2",
          "DESCRIPTION": "We are having a meeting all this week at 12 pm for one hour, with an additional meeting: on the first day 2 hours long. Please: bring your own lunch for the 12 pm meetings.",
          "UID": "00959BC664CA650E933C892C@example.com"
        },
        {
          "DTSTAMP": "20060206T001121Z",
          "DTSTART": {
            "parameters": {
              "TZID": "US/Eastern"
            },
            "value": "20060104T140000"
          },
          "DURATION": "PT1H",
          "RECURRENCE-ID": {
            "parameters": {
              "TZID": "US/Eastern"
            },
            "value": "20060104T120000"
          },
          "SUMMARY": "Event #2 bis",
          "UID": "00959BC664CA650E933C892C@example.com"
        }
      ]
    }
  ]
}
`;

test('CalendarEvent: toJSON', () => {
  const result = CalendarEvent.toJSON(ICS_DATA);
  const prettyResult = JSON.stringify(JSON.parse(result), null, 2);
  assert.strictEqual(prettyResult, JSON_DATA.trim());
});

test('CalendarEvent: toICS', () => {
  const result = CalendarEvent.toICS(JSON_DATA);
  const ics = ICS_DATA;
  const prettyResult = result
    .split('\n')
    .map((line) => (line = '   ' + line))
    .join('\n');
  assert.strictEqual('\n' + prettyResult + '\n', ics);
});
