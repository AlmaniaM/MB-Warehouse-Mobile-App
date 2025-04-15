# Version 0.9.2

## Date: April 10, 2025
#### Description
Got the "Add Pull Sheet Detail From Contract Entry" to now look at the Grower Report dataset, plus got rid of the overscroll app-wide

#### Changes
Portal/Report Service Updates
- "Add Pull Sheet Detail From Contract Entry" now looks at the Grower Report
- Added ability to create multiple Pull Sheet details from the new feature as well
- Got rid of the overscroll

---

# Version 0.9.1

## Date: April 3, 2025
#### Description
Got the Pre-Plant inventory generation complete. Also several bug fixes, report service refinements, some other lingering changes.

#### Changes
Portal/Report Service Updates
- Report Service not in PDT/PST local time, now is
- Shipping Sheet Report customer name bug fix
- Recieved Roots table archive checkbox bug fix
- Couple format refinements in Pull/Ship Sheet reports
- Added page numbers to report PDFs
- Added quantity "Sum" headers to several tables 
- Changed location of inspection label on Ship Sheet report
- Pallet table archive checkbox bug fix
- Pull Sheet version number not increasing in Pull Sheet Form component
- Money formatting refinement
- Added ability to generate Pre-Plant Inventory Version
- Added ability to generate Pre-Plant Inventory 
- Added ability to clear Pre-Plant Inventory 

---

# Version 0.8.10

## Date: March 12, 2025
#### Description
Updated/fixed some PowerBI Reports (details provided in separate email), several bug fixes, added total quantities to Pull Sheet Details, and replaced Juan's email in Pull Sheet email distro list.

#### Changes
Portal/Report Service Updates
- Bug fix: forms now close on delete
- Bug fix: Pull Sheet details remained selected after delete
- Added a Total quantity label to the Pull Sheet Detail Entries
- Added Total quantity of Pull Sheet Details in Report
- Fixed bugged sorting headers on Ordered Root Pool table
- Replaced Juan's email address with "shipping@mikeand...." 

Power BI updates
- Update and sync Power BI environments
- Implement remainder of type-to-search
- Updates on Pre-bud, in-ground and warehouse reports

---

# Version 0.8.9

## Date: March 5, 2025
#### Description
Added ability to wire Received Root Pool Entries to Ordered Root Pool Entries, updated Ordered Root Pool Entry table to have the right Received Quantity show up dynamically.
Also fixed the Received Root Pool table Year filter for "All".

#### Changes
- Added the Ordered Root Pool selector dialog
- Fixed Received Root Year filter

---

# Version 0.8.8

## Date: March 3, 2025
#### Description
Updated Warehouse BI views, added some filters, pointed the PowerApp Shipping Sheet to the new Report Service, fixed several bugs, added "Available" column to Roots Alloc. Inventory, couple other refinements

#### Changes
- Modified underlying Views for PowerBI report: Warehouse Allocations - Warehouse Open Inventory It now only counts Pallet as Warehouse inventory if "Is Received" is True
- Added Received Year Filter to the Received Roots Table in Roots
- Added a Ordered Year Filter to the Roots Allocations UI, that filters the Inventory (top) table
- Added a Rootstock Filter (toggle) to the Allocations UI
- Wired the Shipping Sheet Print out to new Report Service in PowerApp/Flow, and deprecated the Old Shipping Sheet Azure Function
- Added an "Available" column to the Roots Allocations Inventroy table
- Closes new recored line, after create in Sales Contract Entries table
- Properly filters out NOT Outside Sales Companies in the Customer dropdown component (app wide)
- Fixed bug with Pull Sheet NOT deleting when clicking delete
- Fixed bug with Pull Sheets NOT creating when... well.. creating! lol

---

# Version 0.8.7

## Date: February 21, 2025

#### Description
Cleaned up several bugs in Roots Module plus a few refinements and a PowerBI report fix.

#### Changes
- Fixed bug in Ordered Roots where Ordered Quantity column was not showing data when records seleteced
- Added a Default value to Ordered Roots Ordered Year filter
- Added "Auto Fill Remaining Contract Quantity" checkbox in allocations UIs
- Fixed bug in the "Delete" allocation dialog where Rootstock Id was getting mixed up with Variety Id
- Fixed a bug with sorting table headers, in Roots Allocations UI
- Added Order Number column to Roots allocations table
- Fixed "Shipment Output Totals by Ranch" report format in Power BI

---

# Version 0.8.6

## Date: February 17, 2025

#### Description
Added a Pallet Is Revceived filter to the Pallet table, also sorted DigTreeSize selector by the DB order col.

#### Changes
- Added a Pallet Is Revceived filter
- Added proper sorting to DigTreeSize selector

---

# Version 0.8.5

## Date: February 14, 2025

#### Description
Ordered Roots table now has the Ordered Year column. Also made the Pull Sheet Ver. number increase update the UI.
Also added ability to UN-link Contract Entry to Shipment Output Detail records. 

#### Changes
- Add Ordered Year column
- Finished the Pull Sheet Ver. Num increment
- Added little button to set the value to `null`

---

# Version 0.8.4

## Date: February 7, 2025

#### Description
Added the Pull Sheet Number incrementing upon Pull Sheet sending via emai.

#### Changes
- Report Service updates the Pull Sheet Number when a Pull Sheet email is sent
- Client refreshes report upon successful email send

---

# Version 0.8.3

## Date: February 7, 2025

#### Description
Flattened the Pallet + Pallet Contents table into one table per Bennett's request.

#### Changes
- Made Pallet and Pallet Contents one table

---

# Version 0.8.2

## Date: February 7, 2025

#### Description
Few bug fixes in Warehouse plus a couple refinements.

#### Changes
- Fixed bug in the Shipment output form, where record selectors had mismatched state
- Added default Pull Sheet Year filter value to current year
- Added default Shipment Year filter value to current year
- Added filter for deleted in Shipment Output table

---

# Version 0.8.1

## Date: February 4, 2025

#### Description
This update includes a refactors in Warehouse Module -> Digging Input where we moved from the Batch Input Tables to the Pallet tables.

#### Changes
- Refactored Digging Input put table to now point at Pallet/Pallet Contents
- Added API endpoints/models for data transfer of Pallet/Pattet Contents

---

# Version 0.8.0

## Date: January 30, 2025

#### Description
This is the first version of the application that includes the new Change Log feature. For now, this is just a  local MD file in the application bundle. I will maintain this file with every deployment. We will also track every deployment on its on branch in GIT, such that things are easier to diagnose.
Will also increase the version number of the app accordingly. I will start with `0.8.0` since there are two modules to complete. I.e. we will hit v1.0.0 when all modules are complete.

#### Changes
- Added new change log feature so that Bennett can see exactly what has been added/changed, with every deployment

---
