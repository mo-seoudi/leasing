ChatGPT






Friday 11:12 AM

Leasing RAD Data PowerBI.xlsx
Spreadsheet
just to explore and learn.. what if i want to build a React app to replace my Power BI dashboard. i will use the same excel file as data source (we can make it in JSON) and choose the stuff i want to display on the React dashboard

e5c85130-c0c6-4976-920e-0723f8b65bc8.png
i calculate it like this: total Revenue = Sales + Rent and Total Commission & Rent = Commission + Rent


leasing-main.zip
Zip Archive
here is everything i have on Github .. tell me what needs to be updated again

6cc1e7c2-cef0-4b68-93de-0bec572624d4.png

Today 10:07 AM
d1c9b338-392d-4ea0-b60e-1a9facd1cec1.png
can u  replicate this Excel sheet in a React page or table that has the droplist feature for the the programme as in cell A1 and the Academic Year droplist as in cell N1

810f08eb-a3f2-45bd-a80b-ab5c56b132c7.png

6c587c23-8d91-431c-8fd2-f0c420e0c0ee.png
can i just change the way the side bar look and feel?

a25e5c1a-324f-44df-9803-2f7beb40a6fb.png
well, couple of things.. if we are using an existing template, why did u write the whole code of the sidebar and layouts? 2- can we use for now the original dashboard page that we created earlier to show in the programme summary page

22f13b97-ab2e-4758-92d7-d1e3bc16127f.png
ffc80a74-41ad-47ef-8392-8b8c57fd0bc0.png
96f574b9-5f8b-4ca3-8adc-bf099bb8c32e.png
i had them in the components .. i dont have the original App file anymore 

e46cec31-7c83-4f35-acd1-2fa62cbcdb4d.png
c3017b22-a293-495d-b018-0f5f77324e65.png
ok the layout is awful..   needs fixing look how it originally looked like

2f12558a-88fa-4306-a4da-059869c94559.png
for the year on year comparison page i want to have features similar to the attached Excel sheet showing comparison between the selected program or programs vs the previous academic years

c4b0fb2c-b4d6-43f8-9bf6-ef3fccba74ad.png
now for the program comparison page i need it to give me results like the attached excel page

3ffb6dcb-0f08-4c62-8f52-cb28fa9b68bb.png
ok . i want to modify the Programme Summary page.. i dont want the main filter "Display Metric" to be at the top, i need to get rid of it from there.. below we have the filters, then the KPI cards.. i want to reshuffle the cards: start with Total Revenue then School Income, both in a clear way that these are the 2 main cards.. then the sub-cards of Sales, Commission and Rental Fees which are details of the total revenue and school income cards. if easy, i want these cards to work as clickable tabs to act as the filter to the below chart and data to be displayed, if the clickable tabs are too-much work then move the Display Metric filter to this location just below the cards and above the chart

b340dfc4-4fb1-4b75-84e8-aff0ccbfc74f.png
in the Programme Comparison page can we add an "All Time" filter that sums up all the academic years?

69600494-01ff-4497-9aaa-c7031a1cf1f3.png
they are clickable now but nothing to extend they just show the arrow moving but no data is displayed

8970b76f-90b7-4ab7-9bcf-14652ef3d4fa.png
i like the idea of these detailed info and i want to have it as a feature but need to update it a bit.. we need to add an independent filter to the inside table to select the school and academic year. Termly should be the default. displayed figures in the table (monthly and termly) should be in the aligned to the center (testing vs aligned to the left side - but definitely not right side) and if the figure is zero it is better be displayed as a dash only "-" . 

cce0c81c-3dc7-48fa-b85d-7acc83a5f1ea.png
why is the monthly filter not showing any data per month whereas u can see from the total that this programme has figures in the selected year and school

bd9e8bd7-e5e5-4670-95b4-e929078b626f.png
you have ruined it .. 

Today 12:43 PM
fa6ce27a-c0be-44be-8675-6322aea64d77.png
7e91e55c-6929-4590-bead-c50207aa7873.png
in general i like these detailed tabs.. i want to explore more stuff based on them .. i want a page that has the list of all programmes (and academies) which looks mainly like the 2nd screenshot if not expanded.. then each program can be expanded to the info we have in the table and filters we created for the inner details tab.

e2b8b376-797b-463c-9bcc-04c8e40b15fc.png
for the programme directory i currently need it to be similar to the programme details segment in the programme summary and same expandable details and all .. (i will later see how to shuffle the elements of the pages for the final look and design of the platform.. im exploring thoughts now) so give me this programme directory page based on the programme details segment

402653ff-1da0-4940-add6-0e25e3ed7cb7.png
3e4ce562-5293-4004-8b26-d4c64fbbe308.png
i guess i know what i prefer.. i need it to test it.. i think that i want  my Programme directory to be similar to the programme comparison page from top until the Programme Comparison section as in the screenshot, but each programme is expandable and can open with the programme details tabs that we created.. we can add the "Provider" as in the Programme Directory page.. so we would have the total revenue and school income and % of revenue and % of income in similar designs and colors. one thing i will add to the top of the page is a small search tab similar to the one in the new programme directory but smaller in size and located next to the filters at top which are academic year, school and programme group

1ca4c6a6-f880-4365-b019-6f3695d267c9.png
i still need the top of the new programme directory page to have the same features of the programme comparison page  .. the summaries and the years.. i just need to add the search box to it (and note that the programmes = 21 is contained in a tab-like box here unlike what u gave me for the new directory page. 

a8fc7a71-fb66-4d53-82c7-0a11f8a9d642.png
fa2a565a-e5bb-4ed5-8cb1-9f8046605b97.png
just show me how it would look like if i want to have the options of table view and chart view by adding icons at the top of the programs table section which would take me to a similar chart like the one in the programme comparison page 

46c7a697-4a00-49e0-a9e4-21a6f3112c2b.png
1e345ff4-6b02-4aef-a12f-7eb9a7009146.png
yes i like it. i want to add 2 more features. 1st, is the pie chart similar to the one in programme comparison page which compares the percentage of each program to the total (total revenue and school income), so if we add the pie chart icon next to the table and chart icons and make it give the 2 pie charts next to each other the total revenue and total school income similar to the elements we already have in the programmed comparison page.
2nd feature, in the programme directory table of programs as u can see in the 1st screenshot we have the group name "Sports Academies" or "Other Programs" i want these 2 names to also be expandables - they need to show similar data to the tables that open in the individual academies, but instead will show their respective data which we already know which is a summation of the other programs or all sports academies which we already know its parameters. i would be still only lacking a table for the total leasing summing up everything in a similar termly and monthly table, and i need that to be presented in a clever way somewhere


file codes.txt
Document
here u go

2955e530-5730-470d-9137-6e08392c4cd2.png
7b240373-d1e8-40dc-9811-dbe8da6db73b.png
i need to add one more thing to the programme directory page .. similar to the programme summary page, i want a droplist of the all individual programs .. just before the search box..

c0f22a3a-2913-4f21-9aae-90c222892d81.png
just for the sake of being easier on the eye, can we make the top tabs more coherent. i mean that the tab for total revenue and tab of School Income should be equal in size to the 3 above tabs of academic year, school and programme group so they both will align perfectly above each other. then the tab for "Programmes" become smaller and align under the tab "Programme" which is a droplist and the selected period aligns and is equal to the Search bar. can we do that


Pasted code.css
File
actually no i didnt like this alignment and i returned to the previous file as below:


leasing-main (28-7-26).zip
Zip Archive
here's my project architecture and files.. review and give me the complete codes of the files that need to be created (with full path) and those that need to be updated

1d279267-92a2-4c89-a382-4d3eb638236d.png
the detail table inside the individual programs in the programme directory page present the numbers aligned to the left whereas in other places they are aligned to the centre as i have requested earlier.. how to fix that and make the amounts and numbers always aligned to the center in these tables 

5971996e-6056-463e-919e-ceb872bf93a4.png
it is still aligned to the left after updating the ProgrammeDirectoryPage.css and below is what src/components/leasing/ProgrammeDetailView.css looks like:
.programme-detail-panel {
  margin: 10px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 12px;
  box-shadow:
    0 0 0 3px rgba(99, 102, 241, 0.08),
    0 8px 24px rgba(16, 24, 40, 0.08);
}

/* Header */

.programme-detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.programme-detail-eyebrow {
  display: block;
  margin-bottom: 5px;
  color: #4f46e5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.programme-detail-header h2 {
  margin: 0;
  color: #101828;
  font-size: 20px;
  font-weight: 700;
}

.programme-detail-header p {
  margin: 5px 0 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
}

.programme-detail-close {
  min-height: 36px;
  padding: 7px 12px;
  border: 1px solid #d0d5dd;
  border-radius: 7px;
  background: #ffffff;
  color: #344054;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 160ms ease,
    border-color 160ms ease;
}

.programme-detail-close:hover {
  background: #f8fafc;
  border-color: #98a2b3;
}

.programme-detail-close:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.18);
  outline-offset: 2px;
}

/* Controls area */

.programme-detail-controls {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.programme-detail-filters {
  display: grid;
  grid-template-columns: repeat(2, minmax(180px, 240px));
  gap: 12px;
}

.programme-detail-filter {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.programme-detail-filter label {
  color: #344054;
  font-size: 11px;
  font-weight: 600;
}

.programme-detail-filter select {
  width: 100%;
  min-height: 36px;
  padding: 7px 32px 7px 10px;
  border: 1px solid #d0d5dd;
  border-radius: 7px;
  background: #ffffff;
  color: #101828;
  font: inherit;
  font-size: 12px;
  outline: none;
}

.programme-detail-filter select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}

/* Monthly / Termly tabs */

.programme-detail-tabs {
  display: inline-flex;
  gap: 3px;
  margin-bottom: 0;
  padding: 3px;
  background: #f2f4f7;
  border-radius: 8px;
}

.programme-detail-tabs button {
  min-width: 88px;
  padding: 7px 13px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #667085;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.programme-detail-tabs button:hover {
  color: #344054;
}

.programme-detail-tabs button.active {
  background: #ffffff;
  color: #344054;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.12);
}

.programme-detail-tabs button:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.18);
  outline-offset: 1px;
}

/* Summary cards */

.programme-detail-summary {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(200px, 1.25fr))
    repeat(3, minmax(140px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.programme-detail-summary > div {
  display: flex;
  min-width: 0;
  min-height: 82px;
  flex-direction: column;
  justify-content: center;
  padding: 13px 15px;
  background: #f9fafb;
  border: 1px solid #eaecf0;
  border-radius: 8px;
}

.programme-detail-summary .main-summary {
  background: #f8faff;
  border-color: #c7d2fe;
}

.programme-detail-summary span {
  color: #667085;
  font-size: 10px;
  font-weight: 600;
}

.programme-detail-summary strong {
  margin-top: 5px;
  overflow: hidden;
  color: #101828;
  font-size: 17px;
  font-weight: 750;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.programme-detail-summary .main-summary strong {
  font-size: 20px;
}

.programme-detail-summary small {
  margin-top: 4px;
  color: #98a2b3;
  font-size: 9px;
}

/* Detail table */

.programme-detail-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.programme-detail-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  background: #ffffff;
  font-size: 11px;
}

.programme-detail-table th,
.programme-detail-table td {
  padding: 10px 11px;
  border: 1px solid #dfe3e8;
  text-align: center;
  white-space: nowrap;
}

.programme-detail-table thead th {
  background: #eef2f6;
  color: #475467;
  font-size: 10px;
  font-weight: 700;
}

.programme-detail-table th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 135px;
  background: #f8fafc;
  color: #344054;
  text-align: left;
}

.programme-detail-table thead th:first-child {
  z-index: 3;
  background: #eef2f6;
}

.programme-detail-table td {
  color: #344054;
}

.programme-detail-table tbody tr:hover td,
.programme-detail-table tbody tr:hover th {
  background: #fbfcfe;
}

.programme-detail-table .main-measure-row th,
.programme-detail-table .main-measure-row td {
  background: #f8faff;
  color: #1d2939;
  font-weight: 700;
}

.programme-detail-table .main-measure-row th:first-child {
  background: #eef2ff;
}

.detail-total-cell {
  background: #fff8cc !important;
  color: #101828 !important;
  font-weight: 800 !important;
  text-align: center !important;
}

/* Expanded-row compatibility */

.programme-expanded-row .programme-detail-panel {
  margin: 10px;
}

.programme-expanded-row .programme-detail-table th,
.programme-expanded-row .programme-detail-table td {
  text-align: center;
}

.programme-expanded-row .programme-detail-table th:first-child {
  text-align: left;
}

/* Tablet */

@media (max-width: 1100px) {
  .programme-detail-summary {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 850px) {
  .programme-detail-controls {
    align-items: stretch;
    flex-direction: column;
  }

  .programme-detail-filters {
    grid-template-columns: 1fr;
  }

  .programme-detail-tabs {
    display: flex;
    width: 100%;
  }

  .programme-detail-tabs button {
    flex: 1;
  }
}

/* Mobile */

@media (max-width: 650px) {
  .programme-detail-panel {
    margin: 8px;
    padding: 14px;
  }

  .programme-detail-header {
    flex-direction: column;
  }

  .programme-detail-close {
    width: 100%;
  }

  .programme-detail-summary {
    grid-template-columns: 1fr;
  }

  .programme-detail-summary strong,
  .programme-detail-summary .main-summary strong {
    font-size: 18px;
  }

  .programme-detail-table {
    min-width: 760px;
  }
}

28766b8c-7119-4d1d-954c-cc27e68d5b3c.png
 ok now i can get rid of the Programme Summary page and the Programme Comparison page since both of them are reflected in the Programme Directory page (which should be the landing page wfor now). i will only keep the year on year comparison page next to it


Pasted text(13).txt
Document
give me update of the full file: src/layouts/PlatformLayout.jsx

Today 2:55 PM
374548b9-34e9-479d-81df-af3e75b8669a.png
note that when you open the page if the sidebar is expanded the table in hte programme directory dont have an arrow below to slide to the hidden right side items .. if you collapse the sidebar then you will see the hidden right side items.. or if you want to scroll to the right side items u can do that with ur mouse scroll but not through a clear arrow in the buttom

What you are missing is not really an “arrow” from the browser. The horizontal scrollbar exists at the bottom of the full table, but on a laptop you often cannot see it without first scrolling vertically to the end of the table.

A better solution is to add visible left and right scroll buttons directly below the table. They will remain obvious whether the sidebar is expanded or collapsed.

Only these two files need updating:

src/pages/leasing/ProgrammeDirectoryPage.jsx
src/pages/leasing/ProgrammeDirectoryPage.css
1. Update ProgrammeDirectoryPage.jsx
Change the first import from:

import { Fragment, useMemo, useState } from "react";
to:

import {
  Fragment,
  useMemo,
  useRef,
  useState,
} from "react";
Inside ProgrammeDirectoryPage(), immediately after:

const [viewMode, setViewMode] = useState("table");
add:

const directoryTableScrollRef = useRef(null);

function scrollDirectoryTable(direction) {
  const scrollContainer =
    directoryTableScrollRef.current;

  if (!scrollContainer) {
    return;
  }

  const scrollAmount = Math.max(
    280,
    scrollContainer.clientWidth * 0.65
  );

  scrollContainer.scrollBy({
    left:
      direction === "left"
        ? -scrollAmount
        : scrollAmount,
    behavior: "smooth",
  });
}
Then find:

<div className="directory-table-scroll">
  <table className="directory-comparison-table">
and change it to:

<div className="directory-table-area">
  <div
    ref={directoryTableScrollRef}
    className="directory-table-scroll"
  >
    <table className="directory-comparison-table">
At the end of the table, you currently have something similar to:

    </table>
  </div>
Replace that closing section with:

    </table>
  </div>

  <div
    className="directory-horizontal-controls"
    aria-label="Programme table horizontal navigation"
  >
    <button
      type="button"
      onClick={() =>
        scrollDirectoryTable("left")
      }
      aria-label="Scroll table left"
      title="Scroll table left"
    >
      <span aria-hidden="true">←</span>
      Left
    </button>

    <span>
      Scroll to view additional columns
    </span>

    <button
      type="button"
      onClick={() =>
        scrollDirectoryTable("right")
      }
      aria-label="Scroll table right"
      title="Scroll table right"
    >
      Right
      <span aria-hidden="true">→</span>
    </button>
  </div>
</div>
The final structure should therefore look like:

<div className="directory-table-area">
  <div
    ref={directoryTableScrollRef}
    className="directory-table-scroll"
  >
    <table className="directory-comparison-table">
      {/* existing table content */}
    </table>
  </div>

  <div className="directory-horizontal-controls">
    {/* scroll buttons */}
  </div>
</div>
2. Update ProgrammeDirectoryPage.css
Replace your current scroll rule:

.directory-table-scroll {
  width: 100%;
  overflow-x: auto;
}
with:

.directory-table-area {
  width: 100%;
  min-width: 0;
}

.directory-table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: auto;
  scrollbar-color: #98a2b3 #eef1f5;
}

.directory-table-scroll::-webkit-scrollbar {
  height: 11px;
}

.directory-table-scroll::-webkit-scrollbar-track {
  background: #eef1f5;
  border-radius: 999px;
}

.directory-table-scroll::-webkit-scrollbar-thumb {
  min-width: 60px;
  background: #98a2b3;
  border: 2px solid #eef1f5;
  border-radius: 999px;
}

.directory-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #667085;
}
Then add:

.directory-horizontal-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding: 7px 8px;
  background: #f8fafc;
  border: 1px solid #eaecf0;
  border-radius: 8px;
}

.directory-horizontal-controls > span {
  color: #667085;
  font-size: 10px;
  font-weight: 500;
}

.directory-horizontal-controls button {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  background: #ffffff;
  color: #344054;
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.directory-horizontal-controls button:hover {
  background: #eef2ff;
  border-color: #a5b4fc;
  color: #4338ca;
}

.directory-horizontal-controls button:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.18);
  outline-offset: 2px;
}
For small screens, add inside your existing @media (max-width: 700px) section:

.directory-horizontal-controls {
  justify-content: space-between;
}

.directory-horizontal-controls > span {
  display: none;
}

.directory-horizontal-controls button {
  flex: 1;
}
Result
With the sidebar expanded, users will see:

← Left     Scroll to view additional columns     Right →
Clicking the right button smoothly reveals:

% of Revenue

% of School Income

any other columns hidden beyond the laptop viewport

The normal scrollbar will also be thicker and easier to notice. Collapsing the sidebar will still provide more space, but it will no longer be necessary just to access the right-side columns.


give me these 2 files complete

I can absolutely give you the complete ProgrammeDirectoryPage.jsx and ProgrammeDirectoryPage.css files.

However, I can't generate the complete files correctly from what I have right now.

The reason is that I only have:

your CSS file, and

snippets of your project.

I do not have the current ProgrammeDirectoryPage.jsx source, which is now quite large (it contains all the filters, charts, aggregate tabs, expandable rows, view switching, etc.). If I generate a "complete" replacement, I'd be reconstructing large portions of it from memory, which is very likely to overwrite some of the work we've already done.

To produce a drop-in replacement that won't break your app, I need your current:

src/pages/leasing/ProgrammeDirectoryPage.jsx
Once you upload or paste that file, I'll return:

Complete src/pages/leasing/ProgrammeDirectoryPage.jsx

with the horizontal scroll buttons

smooth scrolling

no loss of any existing functionality

Complete src/pages/leasing/ProgrammeDirectoryPage.css

including the improved scrollbar

left/right navigation controls

responsive styling

preserving all your existing styles

This way you'll simply replace the two files and everything will continue to work exactly as it does now, with the new horizontal navigation added.



Pasted text(14).txt
Document

Pasted text (2).txt
Document
src/pages/leasing/ProgrammeDirectoryPage.jsx


src/pages/leasing/ProgrammeDirectoryPage.css


update them fully for me

Here are the two complete updated files, based directly on your current versions. 

 


ProgrammeDirectoryPage_updated.jsx

ProgrammeDirectoryPage_updated.css

Replace:

src/pages/leasing/ProgrammeDirectoryPage.jsx
src/pages/leasing/ProgrammeDirectoryPage.css
The update adds:

visible Left and Right controls beneath the table;

smooth horizontal scrolling;

a clearer horizontal scrollbar;

responsive behavior on small screens;

all your existing filters, charts, tabs, expandable rows and centred detail-table amounts unchanged. 


no man .. what have u done.. i dont want this .. i thought you will add a subtle scrolling arrow to the right end of the screen if there are still more columns to appear and then we click on them to scroll right

You're right — I misunderstood the UI you wanted.

You do not want permanent Left/Right controls below the table.

You want a small floating arrow at the right edge of the table, shown only when more columns are hidden. Clicking it should smoothly scroll the table to the right. Once the user reaches the far right, that arrow should disappear. A matching left arrow can appear when the table has been scrolled.

So revert the two files I just gave you.

The correct implementation should look like this:

[ Programme | Provider | Group | Revenue | Income | ... ]   ›
and after scrolling:

‹   [ ... | Revenue | Income | % Revenue | % School Income ]
The arrows should be:

subtle

vertically centered on the table area

overlaid at the left/right edge

visible only when scrolling in that direction is possible

absent when the full table already fits

I need to update the current ProgrammeDirectoryPage.jsx and ProgrammeDirectoryPage.css again using that exact behavior.


Today 5:31 PM
so, what to update now

Update only these two files:

src/pages/leasing/ProgrammeDirectoryPage.jsx
src/pages/leasing/ProgrammeDirectoryPage.css
Do not keep the permanent Left/Right control bar from the previous version.

1. ProgrammeDirectoryPage.jsx
Change the React import
Replace:

import { Fragment, useMemo, useState } from "react";
with:

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
Add these states and the table reference
Immediately after:

const [viewMode, setViewMode] = useState("table");
add:

const directoryTableScrollRef = useRef(null);

const [canScrollLeft, setCanScrollLeft] =
  useState(false);

const [canScrollRight, setCanScrollRight] =
  useState(false);
Add the scroll-position logic
Place this before clearFilters():

function updateTableScrollButtons() {
  const container =
    directoryTableScrollRef.current;

  if (!container) {
    setCanScrollLeft(false);
    setCanScrollRight(false);
    return;
  }

  const maximumScrollLeft =
    container.scrollWidth -
    container.clientWidth;

  setCanScrollLeft(
    container.scrollLeft > 4
  );

  setCanScrollRight(
    maximumScrollLeft > 4 &&
      container.scrollLeft <
        maximumScrollLeft - 4
  );
}

function scrollDirectoryTable(direction) {
  const container =
    directoryTableScrollRef.current;

  if (!container) {
    return;
  }

  container.scrollBy({
    left:
      direction === "right"
        ? container.clientWidth * 0.65
        : -container.clientWidth * 0.65,
    behavior: "smooth",
  });
}
Add this effect inside the component
Place it after your memoized data and before the handlers:

useEffect(() => {
  const container =
    directoryTableScrollRef.current;

  if (!container || viewMode !== "table") {
    return undefined;
  }

  updateTableScrollButtons();

  const handleScroll = () => {
    updateTableScrollButtons();
  };

  container.addEventListener(
    "scroll",
    handleScroll
  );

  const resizeObserver =
    new ResizeObserver(() => {
      updateTableScrollButtons();
    });

  resizeObserver.observe(container);

  if (container.firstElementChild) {
    resizeObserver.observe(
      container.firstElementChild
    );
  }

  return () => {
    container.removeEventListener(
      "scroll",
      handleScroll
    );

    resizeObserver.disconnect();
  };
}, [
  viewMode,
  programmeData,
  selectedProgrammeDetail,
]);
This also reacts when the sidebar is expanded or collapsed because the table container changes width.

Replace the current table wrapper
Replace:

<div className="directory-table-scroll">
  <table className="directory-comparison-table">
with:

<div className="directory-table-shell">
  {canScrollLeft && (
    <button
      type="button"
      className="directory-scroll-arrow directory-scroll-arrow-left"
      onClick={() =>
        scrollDirectoryTable("left")
      }
      aria-label="Scroll table left"
      title="Scroll table left"
    >
      ‹
    </button>
  )}

  <div
    ref={directoryTableScrollRef}
    className="directory-table-scroll"
  >
    <table className="directory-comparison-table">
Then replace the closing part:

  </table>
</div>
with:

    </table>
  </div>

  {canScrollRight && (
    <button
      type="button"
      className="directory-scroll-arrow directory-scroll-arrow-right"
      onClick={() =>
        scrollDirectoryTable("right")
      }
      aria-label="Scroll table right"
      title="Scroll table right"
    >
      ›
    </button>
  )}
</div>
The final structure should be:

<div className="directory-table-shell">
  {canScrollLeft && (
    <button className="directory-scroll-arrow directory-scroll-arrow-left">
      ‹
    </button>
  )}

  <div
    ref={directoryTableScrollRef}
    className="directory-table-scroll"
  >
    <table className="directory-comparison-table">
      {/* existing table */}
    </table>
  </div>

  {canScrollRight && (
    <button className="directory-scroll-arrow directory-scroll-arrow-right">
      ›
    </button>
  )}
</div>
Your existing table code remains unchanged. 


2. ProgrammeDirectoryPage.css
Keep your current file, but replace the existing table-scroll block with:

.directory-table-shell {
  position: relative;
  width: 100%;
  min-width: 0;
}

.directory-table-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: #c4cad4 #f2f4f7;
}

.directory-table-scroll::-webkit-scrollbar {
  height: 7px;
}

.directory-table-scroll::-webkit-scrollbar-track {
  background: #f2f4f7;
  border-radius: 999px;
}

.directory-table-scroll::-webkit-scrollbar-thumb {
  background: #c4cad4;
  border-radius: 999px;
}

.directory-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #98a2b3;
}
Then add:

.directory-scroll-arrow {
  position: absolute;
  top: 50%;
  z-index: 8;
  display: flex;
  width: 30px;
  height: 44px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  color: #475467;
  font: inherit;
  font-size: 25px;
  line-height: 1;
  cursor: pointer;
  box-shadow:
    0 2px 8px rgba(16, 24, 40, 0.14);
  transform: translateY(-50%);
  transition:
    background 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    opacity 150ms ease;
}

.directory-scroll-arrow:hover {
  border-color: #a5b4fc;
  background: #eef2ff;
  color: #4338ca;
}

.directory-scroll-arrow:focus-visible {
  outline:
    3px solid rgba(99, 102, 241, 0.18);
  outline-offset: 2px;
}

.directory-scroll-arrow-left {
  left: 6px;
}

.directory-scroll-arrow-right {
  right: 6px;
}
You may also add a subtle fade behind the arrows:

.directory-scroll-arrow-left {
  background:
    linear-gradient(
      to right,
      #ffffff 60%,
      rgba(255, 255, 255, 0.86)
    );
}

.directory-scroll-arrow-right {
  background:
    linear-gradient(
      to left,
      #ffffff 60%,
      rgba(255, 255, 255, 0.86)
    );
}
Remove any CSS relating to:

.directory-horizontal-controls
.directory-scroll-hint
because those belonged to the unwanted bottom control bar. Your current table and expanded-row styling can remain as it is. 


The right arrow will now appear only when columns are hidden, disappear at the end, and a left arrow will appear only after the user has moved right.


import { Fragment, useMemo, useState } from "react";

import {
Bar,
BarChart,
CartesianGrid,
Cell,
Legend,
Pie,
PieChart,
ResponsiveContainer,
Tooltip,
XAxis,
YAxis,
} from "recharts";

import ProgrammeDetailView from "../../components/leasing/ProgrammeDetailView";

import {
academicYears,
filterRecords,
formatCurrency,
getAvailableProgrammes,
getProgrammeBreakdown,
programmeGroups,
schools,
} from "../../lib/dashboardData";

import "./ProgrammeComparisonPage.css";
import "./ProgrammeDirectoryPage.css";

const PIE_COLORS = [
"#2563eb",
"#f97316",
"#16a34a",
"#7c3aed",
"#0891b2",
"#eab308",
"#dc2626",
"#4f46e5",
"#059669",
"#db2777",
"#65a30d",
"#ea580c",
"#0284c7",
"#9333ea",
"#0f766e",
"#c2410c",
"#475569",
"#be123c",
];

const AGGREGATE_TABS = [
{
key: "sports-academies",
label: "Sports Academies",
programGroup: "Sports Academies",
},
{
key: "other-programs",
label: "Other Programs",
programGroup: "Other Programs",
},
{
key: "all-groups",
label: "All Groups",
programGroup: "",
},
];

function toNumber(value) {
const number = Number(value);

return Number.isFinite(number) ? number : 0;
}

function formatPercentage(value) {
const number = toNumber(value);

if (number === 0) {
return "0%";
}

if (number > 0 && number < 1) {
return "<1%";
}

return ${number.toFixed(0)}%;
}

function formatCompactNumber(value) {
return new Intl.NumberFormat("en-US", {
notation: "compact",
maximumFractionDigits: 1,
}).format(toNumber(value));
}

function TableIcon() {
return (
<svg viewBox="0 0 24 24" aria-hidden="true">
<rect x="3" y="4" width="18" height="16" rx="2" />

  <path d="M3 9h18" />
  <path d="M3 14h18" />
  <path d="M9 4v16" />
</svg>
);
}

function ChartIcon() {
return (
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M4 20V10" />
<path d="M10 20V4" />
<path d="M16 20v-7" />
<path d="M22 20H2" />
</svg>
);
}

function PieIcon() {
return (
<svg viewBox="0 0 24 24" aria-hidden="true">
<path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />

  <path d="M15 3.5A8.5 8.5 0 0 1 20.5 9H15V3.5Z" />
</svg>
);
}

function DirectoryPieCard({
title,
description,
data,
dataKey,
}) {
const chartData = data.filter(
(item) => toNumber(item[dataKey]) > 0
);

return (
<section className="directory-pie-card">
<div className="directory-pie-heading">
<h3>{title}</h3>

    <p>{description}</p>
  </div>

  {chartData.length === 0 ? (
    <div className="directory-empty-state">
      No values are available for this chart.
    </div>
  ) : (
    <div className="directory-pie-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey={dataKey}
            nameKey="programme"
            cx="50%"
            cy="43%"
            innerRadius={52}
            outerRadius={108}
            paddingAngle={1}
          >
            {chartData.map((item, index) => (
              <Cell
                key={`${item.programme}-${dataKey}`}
                fill={
                  PIE_COLORS[
                    index % PIE_COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) =>
              formatCurrency(value)
            }
          />

          <Legend
            verticalAlign="bottom"
            wrapperStyle={{
              fontSize: "10px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )}
</section>
);
}

export default function ProgrammeDirectoryPage() {
const latestAcademicYear =
academicYears[academicYears.length - 1] || "";

const [filters, setFilters] = useState({
academicYear: latestAcademicYear,
school: "",
programGroup: "",
program: "",
searchText: "",
});

const [
selectedProgrammeDetail,
setSelectedProgrammeDetail,
] = useState("");

const [
selectedAggregateDetail,
setSelectedAggregateDetail,
] = useState("");

const [viewMode, setViewMode] = useState("table");

const availableProgrammes = useMemo(
() =>
getAvailableProgrammes(
filters.programGroup
),
[filters.programGroup]
);

/*

Full dataset used by the working ProgrammeDetailView.

Its own School and Academic Year dropdowns therefore remain

independent from the directory page filters.
*/
const allRecords = useMemo(
() => filterRecords({}),
[]
);

/*

Page-filtered records used by the directory table,

bar chart, pie charts and KPI values.
*/
const filteredRecords = useMemo(
() =>
filterRecords({
academicYear: filters.academicYear,
school: filters.school,
programGroup: filters.programGroup,
program: filters.program,
}),
[
filters.academicYear,
filters.school,
filters.programGroup,
filters.program,
]
);

const programmeData = useMemo(() => {
const breakdown =
getProgrammeBreakdown(filteredRecords);

const searchValue = filters.searchText
  .trim()
  .toLowerCase();

const visibleProgrammes = breakdown.filter(
  (item) => {
    if (!searchValue) {
      return true;
    }

    const programmeName = String(
      item.programme || ""
    ).toLowerCase();

    const providerName = String(
      item.provider || ""
    ).toLowerCase();

    return (
      programmeName.includes(searchValue) ||
      providerName.includes(searchValue)
    );
  }
);

const totalRevenue = visibleProgrammes.reduce(
  (total, item) =>
    total + toNumber(item.totalRevenue),
  0
);

const totalSchoolIncome = visibleProgrammes.reduce(
  (total, item) =>
    total + toNumber(item.schoolIncome),
  0
);

return visibleProgrammes
  .map((item) => ({
    ...item,

    revenueShare:
      totalRevenue > 0
        ? (toNumber(item.totalRevenue) /
            totalRevenue) *
          100
        : 0,

    incomeShare:
      totalSchoolIncome > 0
        ? (toNumber(item.schoolIncome) /
            totalSchoolIncome) *
          100
        : 0,
  }))
  .sort(
    (a, b) =>
      toNumber(b.totalRevenue) -
      toNumber(a.totalRevenue)
  );
}, [filteredRecords, filters.searchText]);

const totals = useMemo(
() =>
programmeData.reduce(
(result, item) => ({
totalRevenue:
result.totalRevenue +
toNumber(item.totalRevenue),

      schoolIncome:
        result.schoolIncome +
        toNumber(item.schoolIncome),
    }),
    {
      totalRevenue: 0,
      schoolIncome: 0,
    }
  ),
[programmeData]
);

const aggregateTabs = useMemo(
() =>
AGGREGATE_TABS.map((tab) => {
const sourceRecords = tab.programGroup
? allRecords.filter(
(record) =>
record.programGroup ===
tab.programGroup
)
: allRecords;

    /*
     * ProgrammeDetailView filters records using:
     * record.program === programme
     *
     * For group summaries, copy the records and temporarily
     * assign one common programme name. The original component
     * itself remains unchanged.
     */
    const detailRecords = sourceRecords.map(
      (record) => ({
        ...record,
        program: tab.label,
      })
    );

    return {
      ...tab,
      detailRecords,
      disabled: detailRecords.length === 0,
    };
  }),
[allRecords]
);

const selectedAggregate = useMemo(
() =>
aggregateTabs.find(
(tab) =>
tab.key === selectedAggregateDetail
) || null,
[aggregateTabs, selectedAggregateDetail]
);

function handleFilterChange(name, value) {
setFilters((current) => {
const updatedFilters = {
...current,
[name]: value,
};

  if (name === "programGroup") {
    updatedFilters.program = "";
  }

  return updatedFilters;
});

setSelectedProgrammeDetail("");
setSelectedAggregateDetail("");
}

function handleProgrammeClick(programme) {
setSelectedAggregateDetail("");

setSelectedProgrammeDetail((current) =>
  current === programme ? "" : programme
);
}

function handleAggregateClick(aggregateKey) {
setSelectedProgrammeDetail("");

setSelectedAggregateDetail((current) =>
  current === aggregateKey
    ? ""
    : aggregateKey
);
}

function handleViewModeChange(mode) {
setViewMode(mode);

if (mode !== "table") {
  setSelectedProgrammeDetail("");
}
}

function clearFilters() {
setFilters({
academicYear: latestAcademicYear,
school: "",
programGroup: "",
program: "",
searchText: "",
});

setSelectedProgrammeDetail("");
setSelectedAggregateDetail("");
setViewMode("table");
}

const selectedPeriodLabel =
filters.academicYear || "All Time";

return (
<section className="programme-comparison-page programme-directory-page">
<section className="programme-filter-card">
<div className="programme-card-heading programme-filter-heading">
<div>
<h2>Directory Filters</h2>

        <p>
          Compare programmes and expand any programme or
          programme group to view detailed monthly or
          termly figures.
        </p>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={clearFilters}
      >
        Clear Filters
      </button>
    </div>

    <div className="programme-filter-grid directory-comparison-filter-grid">
      <div className="programme-filter">
        <label htmlFor="directory-academic-year">
          Academic Year
        </label>

        <select
          id="directory-academic-year"
          value={filters.academicYear}
          onChange={(event) =>
            handleFilterChange(
              "academicYear",
              event.target.value
            )
          }
        >
          <option value="">All Time</option>

          {academicYears.map((academicYear) => (
            <option
              key={academicYear}
              value={academicYear}
            >
              {academicYear}
            </option>
          ))}
        </select>
      </div>

      <div className="programme-filter">
        <label htmlFor="directory-school">
          School
        </label>

        <select
          id="directory-school"
          value={filters.school}
          onChange={(event) =>
            handleFilterChange(
              "school",
              event.target.value
            )
          }
        >
          <option value="">All Schools</option>

          {schools.map((school) => (
            <option
              key={school}
              value={school}
            >
              {school}
            </option>
          ))}
        </select>
      </div>

      <div className="programme-filter">
        <label htmlFor="directory-programme-group">
          Programme Group
        </label>

        <select
          id="directory-programme-group"
          value={filters.programGroup}
          onChange={(event) =>
            handleFilterChange(
              "programGroup",
              event.target.value
            )
          }
        >
          <option value="">All Groups</option>

          {programmeGroups.map((group) => (
            <option
              key={group}
              value={group}
            >
              {group}
            </option>
          ))}
        </select>
      </div>

      <div className="programme-filter">
        <label htmlFor="directory-programme">
          Programme
        </label>

        <select
          id="directory-programme"
          value={filters.program}
          onChange={(event) =>
            handleFilterChange(
              "program",
              event.target.value
            )
          }
        >
          <option value="">
            All Programmes
          </option>

          {availableProgrammes.map(
            (programme) => (
              <option
                key={programme}
                value={programme}
              >
                {programme}
              </option>
            )
          )}
        </select>
      </div>

      <div className="programme-filter directory-search-filter">
        <label htmlFor="directory-search">
          Search
        </label>

        <input
          id="directory-search"
          type="search"
          value={filters.searchText}
          placeholder="Programme or provider"
          onChange={(event) =>
            handleFilterChange(
              "searchText",
              event.target.value
            )
          }
        />
      </div>
    </div>
  </section>

  <section className="programme-summary-strip">
    <div>
      <span>Total Revenue</span>

      <strong>
        {formatCurrency(
          totals.totalRevenue
        )}
      </strong>
    </div>

    <div>
      <span>School Income</span>

      <strong>
        {formatCurrency(
          totals.schoolIncome
        )}
      </strong>
    </div>

    <div>
      <span>Programmes</span>

      <strong>{programmeData.length}</strong>
    </div>

    <div>
      <span>Selected Period</span>

      <strong>{selectedPeriodLabel}</strong>
    </div>
  </section>

  <section className="directory-table-card">
    <div className="directory-table-heading">
      <div className="directory-title-block">
        <h2>Programme Directory</h2>

        <p>
          Revenue, school income and contribution to total
          leasing performance. Expand a programme or a
          summary tab for the detailed monthly or termly
          table.
        </p>
      </div>

      <div className="directory-header-controls">
        <div
          className="directory-aggregate-tabs"
          role="group"
          aria-label="Programme group details"
        >
          {aggregateTabs.map((tab) => {
            const isSelected =
              selectedAggregateDetail === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                className={
                  isSelected ? "active" : ""
                }
                disabled={tab.disabled}
                onClick={() =>
                  handleAggregateClick(tab.key)
                }
                aria-expanded={isSelected}
              >
                <span
                  className={`directory-aggregate-arrow ${
                    isSelected ? "open" : ""
                  }`}
                >
                  ▶
                </span>

                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          className="directory-view-toggle"
          role="group"
          aria-label="Programme directory view"
        >
          <button
            type="button"
            className={
              viewMode === "table"
                ? "active"
                : ""
            }
            onClick={() =>
              handleViewModeChange("table")
            }
            aria-pressed={
              viewMode === "table"
            }
            title="Table view"
          >
            <TableIcon />

            <span>Table</span>
          </button>

          <button
            type="button"
            className={
              viewMode === "chart"
                ? "active"
                : ""
            }
            onClick={() =>
              handleViewModeChange("chart")
            }
            aria-pressed={
              viewMode === "chart"
            }
            title="Chart view"
          >
            <ChartIcon />

            <span>Chart</span>
          </button>

          <button
            type="button"
            className={
              viewMode === "pie"
                ? "active"
                : ""
            }
            onClick={() =>
              handleViewModeChange("pie")
            }
            aria-pressed={viewMode === "pie"}
            title="Pie view"
          >
            <PieIcon />

            <span>Pie</span>
          </button>
        </div>
      </div>
    </div>

    {selectedAggregate && (
      <div className="directory-aggregate-detail">
        <ProgrammeDetailView
          key={selectedAggregate.key}
          programme={selectedAggregate.label}
          records={
            selectedAggregate.detailRecords
          }
          onClose={() =>
            setSelectedAggregateDetail("")
          }
        />
      </div>
    )}

    {programmeData.length === 0 ? (
      <div className="directory-empty-state">
        No programme records are available for the
        selected filters.
      </div>
    ) : viewMode === "chart" ? (
      <div className="directory-chart-container">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={programmeData.slice(0, 20)}
            margin={{
              top: 15,
              right: 20,
              bottom: 85,
              left: 20,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="programme"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
              tick={{ fontSize: 10 }}
            />

            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={
                formatCompactNumber
              }
            />

            <Tooltip
              formatter={(value, name) => [
                formatCurrency(value),
                name,
              ]}
            />

            <Legend />

            <Bar
              dataKey="totalRevenue"
              name="Total Revenue"
              fill="#1679a7"
              radius={[4, 4, 0, 0]}
            />

            <Bar
              dataKey="schoolIncome"
              name="School Income"
              fill="#e97832"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : viewMode === "pie" ? (
      <div className="directory-pie-grid">
        <DirectoryPieCard
          title="% of Total Leasing Revenue"
          description="Each programme’s share of total revenue under the selected directory filters."
          data={programmeData}
          dataKey="totalRevenue"
        />

        <DirectoryPieCard
          title="% of Total Leasing School Income"
          description="Each programme’s share of school income under the selected directory filters."
          data={programmeData}
          dataKey="schoolIncome"
        />
      </div>
    ) : (
      <div className="directory-table-scroll">
        <table className="directory-comparison-table">
          <thead>
            <tr>
              <th>Programme</th>
              <th>Provider</th>
              <th>Programme Group</th>
              <th>Total Revenue</th>
              <th>School Income</th>
              <th>% of Revenue</th>
              <th>% of School Income</th>
            </tr>
          </thead>

          <tbody>
            {programmeData.map((item) => {
              const isSelected =
                selectedProgrammeDetail ===
                item.programme;

              return (
                <Fragment key={item.programme}>
                  <tr
                    className={
                      isSelected
                        ? "directory-selected-row"
                        : ""
                    }
                  >
                    <th>
                      <button
                        type="button"
                        className="directory-programme-button"
                        onClick={() =>
                          handleProgrammeClick(
                            item.programme
                          )
                        }
                        aria-expanded={
                          isSelected
                        }
                      >
                        <span>
                          {item.programme}
                        </span>

                        <span
                          className={
                            isSelected
                              ? "directory-row-arrow open"
                              : "directory-row-arrow"
                          }
                        >
                          ▶
                        </span>
                      </button>
                    </th>

                    <td>
                      {item.provider || "—"}
                    </td>

                    <td>
                      {item.programGroup || "—"}
                    </td>

                    <td className="directory-revenue-value">
                      {formatCurrency(
                        item.totalRevenue
                      )}
                    </td>

                    <td className="directory-income-value">
                      {formatCurrency(
                        item.schoolIncome
                      )}
                    </td>

                    <td>
                      <div className="directory-percentage-cell">
                        <span>
                          {formatPercentage(
                            item.revenueShare
                          )}
                        </span>

                        <div className="directory-percentage-track">
                          <div
                            className="directory-percentage-fill directory-revenue-fill"
                            style={{
                              width: `${Math.min(
                                toNumber(
                                  item.revenueShare
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="directory-percentage-cell">
                        <span>
                          {formatPercentage(
                            item.incomeShare
                          )}
                        </span>

                        <div className="directory-percentage-track">
                          <div
                            className="directory-percentage-fill directory-income-fill"
                            style={{
                              width: `${Math.min(
                                toNumber(
                                  item.incomeShare
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {isSelected && (
                    <tr className="programme-expanded-row directory-expanded-row">
                      <td colSpan={7}>
                        <ProgrammeDetailView
                          programme={
                            item.programme
                          }
                          records={allRecords}
                          onClose={() =>
                            setSelectedProgrammeDetail(
                              ""
                            )
                          }
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
</section>
);
}


Close
