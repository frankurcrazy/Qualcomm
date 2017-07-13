/*===========================================================================
FILE: 
   HelperFunctions.js

DESCRIPTION:
   Implementation of functions used in various HTML displays.

Copyright (C) 2009 QUALCOMM Incorporated. All rights reserved.
                   QUALCOMM Proprietary/GTDR

All data and information contained in or disclosed by this document is
confidential and proprietary information of QUALCOMM Incorporated and all
rights therein are expressly reserved.  By accepting this material the
recipient agrees that this material and the information contained therein
is held in confidence and in trust and will not be used, copied, reproduced
in whole or in part, nor its contents revealed in any manner to others
without the express written permission of QUALCOMM Incorporated.
===========================================================================*/

/*===========================================================================
METHOD:
   GetTextFromName

DESCRIPTION:
   Generates field text value from database based on field name

PARAMETERS:
   fields      [ I ] - QXDM DB parsed fields object (IColorItemFields)
   name        [ I ] - Partial field name
   
RETURN VALUE:
   BSTR - field value text
===========================================================================*/
function GetTextFromName( fields, name )
{
   var text = " ";
   if (fields == null)
   {
      return text;
   }

   var idx = fields.GetFieldIndex( name, 1 );
   if (idx != 0xFFFFFFFF)
   {
      text = fields.GetFieldValueText( idx );
   }
   
   return text;
}

/*===========================================================================
METHOD:
   GetValueFromName

DESCRIPTION:
   Generates field value from database based on field name

PARAMETERS:
   fields      [ I ] - QXDM DB parsed fields object (IColorItemFields)
   name        [ I ] - Partial field name
   
RETURN VALUE:
   VARIANT - field value as a VARIANT   
===========================================================================*/
function GetValueFromName( fields, name )
{
   var value = 0;
   if (fields == null)
   {
      return value;
   }

   var idx = fields.GetFieldIndex( name, 1 );
   if (idx != 0xFFFFFFFF)
   {
      value = fields.GetFieldValue( idx );
   }
   
   return value;
}

/*===========================================================================
METHOD:
   ConvertCDMATime

DESCRIPTION:
   Convert a raw hexadecimal value string (64-bit) representing
   CDMA time into a JScript 'Date' object 
   
PARAMETERS:
   hexStr      [ I ] - 64-bit hexadecimal string (0xAABBCCDD00112233)
   
RETURN VALUE:
   'Date' object
===========================================================================*/
function ConvertCDMATime( hexStr )
{
   // Check argument form
   var len = hexStr.length;
   if (len != 18)
   {
      return new Date( 0 );
   }

   // Remove chips
   var tmp = hexStr.slice( 0, 14 );
   
   // Convert from 1.25 ms units to 1 ms units
   tmp *= 1.25;
   
   // We now have elapsed milliseconds since 01/06/80 00:00:00, we want to 
   // convert that to elapsed milliseconds since 01/01/70 00:00:00, so we
   // add the missing decade
   var dateAdjust = new Date( Date.UTC( 1980, 0, 6, 0, 0, 0, 0 ) );
   tmp += dateAdjust.valueOf();
   
   return new Date( tmp );
}

/*===========================================================================
METHOD:
   ClearSimpleFieldTable

DESCRIPTION:
   Clear a simple field table (a TBODY object where the first column
   is the field name and the second column is the field value) by 
   setting the field values to "-"

PARAMETERS:
   TableName   [ I ] - TBODY object
   
RETURN VALUE:
   None
===========================================================================*/
function ClearSimpleFieldTable( TableName )
{
   var CurRows = TableName.rows.length;
   for (var r = 0; r < CurRows; r++)
   {
      TableName.rows[r].cells[1].innerText = "-";
   }
}

/*===========================================================================
METHOD:
   DeleteExcessRows

DESCRIPTION:
   Delete the excess rows in a table that dynamically reuses rows

PARAMETERS:
   TableName   [ I ] - TABLE/TBODY object
   Start       [ I ] - First relevant row
   CurTotal    [ I ] - Previous number of rows (total)
   Desired     [ I ] - Desired number of rows (from start)
   Clear       [ I ] - Instead of removing all rows, set value of
                       every cell in the first relevant row to '-'?
   
RETURN VALUE:
   None
===========================================================================*/
function DeleteExcessRows( TableName, Start, CurTotal, Desired, Clear )
{
   // Delete excess rows
   var NewTotal = Start + Desired;
   for (var r = CurTotal - 1; r >= NewTotal; r--)
   {
      if (r != Start || Clear == false)
      {
         TableName.deleteRow( r );
      }
      else
      {
         var CurCells = TableName.rows[r].cells.length;
         for (var c = 0; c < CurCells; c++)
         {
            TableName.rows[r].cells[c].innerText = "-";
         }
      }
   }
}

/*===========================================================================
METHOD:
   ManageRows

DESCRIPTION:
   Manage (add/delete) the rows in a table that dynamically reuses rows

PARAMETERS:
   TableName   [ I ] - TABLE/TBODY object
   Start       [ I ] - First relevant row
   CurTotal    [ I ] - Previous number of rows (total)
   Desired     [ I ] - Desired number of rows (from start)
   Cols        [ I ] - Number of columns
   Clear       [ I ] - Instead of removing all rows, set value of
                       every cell in the first relevant row to '-'?
   
RETURN VALUE:
   None
===========================================================================*/
function ManageRows( TableName, Start, CurTotal, Desired, Cols, Clear )
{
   var NewTotal = Start + Desired;
   if (CurTotal < NewTotal)
   {
      // Add new rows
      var TableRow;
      var TableCell;
   
      for (var r = CurTotal; r < NewTotal; r++)
      {
         TableRow = TableName.insertRow();
         for (var c = 0; c < Cols; c++)
         {     
            TableCell = TableRow.insertCell();
         }
      }
   }
   else
   {
      // Delete excess rows
      for (var r = CurTotal - 1; r >= NewTotal; r--)
      {
         if (r != Start || Clear == false)
         {
            TableName.deleteRow( r );
         }
         else
         {
            for (var c = 0; c < Cols; c++)
            {
               TableName.rows[r].cells[c].innerText = "-";
            }
         }
      }
   }
}

/*===========================================================================
METHOD:
   PopulateSimpleFieldTable

DESCRIPTION:
   Populate a simple field table (a TBODY object where the first 
   column is the field name and the second column is the field 
   value) with the contents of a QXDM DB parsed field object
   
   NOTE: This function reuses rows for the sake of efficiency,
   so if you do not want to use the DB fields names and the
   DB fields are all being used then add your custom names in
   advance as anything other than '-' will be preserved

PARAMETERS:
   Fields      [ I ] - QXDM DB parsed fields object (IColorItemFields)
   TableName   [ I ] - TBODY object
   
RETURN VALUE:
   None
===========================================================================*/
function PopulateSimpleFieldTable( Fields, TableName )
{         
   if (Fields == null)
   {
      return value;
   }
      
   // Convert the fields to table rows
   var FieldCount = Fields.GetFieldCount();
   var CurRows = TableName.rows.length;
   
   var TableRow;
   var TableCell;
   
   // Add in each field as a row (field name, field value)
   for (var f = 0; f < FieldCount; f++)
   {      
      FieldVal = Fields.GetFieldValueText( f );
      
      // New row?
      if (f >= CurRows)
      {
         TableRow = TableName.insertRow();
         
         TableCell = TableRow.insertCell();
         TableCell = TableRow.insertCell();
         
         FieldName = Fields.GetFieldName( f, true );
         TableName.rows[f].cells[0].innerText = FieldName;
      }
      else if (TableName.rows[f].cells[0].innerText == "-")
      {
         FieldName = Fields.GetFieldName( f, true );
         TableName.rows[f].cells[0].innerText = FieldName;
      }
      
      TableName.rows[f].cells[1].innerText = FieldVal;
   }
   
   DeleteExcessRows( TableName, 0, CurRows, FieldCount, true );
}

/*===========================================================================
METHOD:
   PopulateSimpleFieldTableTabs

DESCRIPTION:
   Populate a simple field table with tabs support (a TBODY object where the first 
   column is the field name and the second column is the field 
   value) with the contents of a QXDM DB parsed field object
   
   NOTE: This function reuses rows for the sake of efficiency,
   so if you do not want to use the DB fields names and the
   DB fields are all being used then add your custom names in
   advance as anything other than '-' will be preserved

PARAMETERS:
   Fields      [ I ] - QXDM DB parsed fields object (IColorItemFields)
   TableName   [ I ] - TBODY object
   bTabs       [ I ] - Multiple tabs support flag
   bDefault    [ I ] - Default tab flag
   nStackID    [ I ] - Tab's stack ID
   
RETURN VALUE:
   None
===========================================================================*/
function PopulateSimpleFieldTableTabs( Fields, TableName, bTabs, bDefault, nStackID )
{         
   var bOK = false;
   
   if (bTabs == false && bDefault == false)
   {
      // Not default tab
      return bOK;
   }

   var t = 0;
   if (bTabs == true)
   {
      t = 1;
      
      if (FieldCount < 1)
      {
         return bOK;
      }
   
      var StackID = Fields.GetFieldValue( 0 );
      if (StackID != nStackID)
      {
         // Wrong stack for this tab
         return bOK;
      }
   }
   
   if (Fields == null)
   {
      return bOK;
   }
      
   // Convert the fields to table rows
   var FieldCount = Fields.GetFieldCount();
   var CurRows = TableName.rows.length;
   
   var TableRow;
   var TableCell;
   
   // Add in each field as a row (field name, field value)
   for (var f = t; f < FieldCount; f++)
   {      
      FieldVal = Fields.GetFieldValueText( f );
      
      // New row?
      if (f >= CurRows)
      {
         TableRow = TableName.insertRow();
         
         TableCell = TableRow.insertCell();
         TableCell = TableRow.insertCell();
         
         FieldName = Fields.GetFieldName( f, true );
         TableName.rows[f].cells[0].innerText = FieldName;
      }
      else if (TableName.rows[f].cells[0].innerText == "-")
      {
         FieldName = Fields.GetFieldName( f, true );
         TableName.rows[f].cells[0].innerText = FieldName;
      }
      
      TableName.rows[f].cells[1].innerText = FieldVal;
   }
   
   DeleteExcessRows( TableName, 0, CurRows, FieldCount, true );
   
   bOK = true;
   return bOK;
}

/*===========================================================================
METHOD:
   Precision

DESCRIPTION:
   Drop digits from a floating point value, optionally treatng it
   as a percentage value (in which case the value is multiplied
   by 100.0 and " %" is added to the resulting string)
   
PARAMETERS:
   Val         [ I ] - The value in question
   Digits      [ I ] - Number of digits to keep after the decimal
   Percent     [ I ] - Treat as a percentage value?
   
RETURN VALUE:
   Formatted value string
===========================================================================*/
function Precision( Val, Digits, Percent )
{
   if (Percent == true)
   {
      Val *= 100.0;
   }

   var result = Val.toString();
   
   // Keep 'Digits' decimal places
   var tmp = Val.toString();
   var offset = tmp.indexOf(".");
   if (offset >= 0)
   {  
      var adj = 1;
      if (Digits == 0)
      {
         adj = 0;
      }
      
      result = tmp.substring( 0, offset + Digits + adj );
   }
   
   if (Percent == true)
   {
      result += " %";
   }
   
   return result;
}

/*===========================================================================
METHOD:
   FormatBCDDigit

DESCRIPTION:
   Convert a digit value greater than 9 to a HEX digit

PARAMETERS:   
   Digit       [ I ] - Digit to be converted

RETURN VALUE:
   Formatted value string
===========================================================================*/
function FormatBCDDigit( Digit )
{
   var Str = Digit.toString();
   switch (Digit)
   {
      case 10:
         Str = "A";
         break;
         
      case 11:
         Str = "B";
         break;
         
      case 12:
         Str = "C";
         break;
         
      case 13:
         Str = "D";
         break;
         
      case 14:
         Str = "E";
         break;
         
      case 15:
         Str = "F";
         break;
         
      default:
         if (Digit > 15)
         {
            Str = "-";
         }
   }
   return Str;
}

/*===========================================================================
METHOD:
   GPSTimeToString

DESCRIPTION:
   Convert GPS time to string

PARAMETERS:
   GPSTime       [ I ] - GPS time to be converted

RETURN VALUE:
   GPS time as string
===========================================================================*/
function GPSTimeToString( GPSTime )
{
   var Txt = GPSTime.toFixed( 3 );

   var Hour = "";
   var Min  = "";
   var Sec  = "";
   var MSec = "";

   switch (Txt.length)
   {
      case 10:
      {
         Hour = Txt.substr( 0, 2 );
         Min  = Txt.substr( 2, 2 );
         Sec  = Txt.substr( 4, 2 );
         MSec = Txt.substr( 7, 3 );
      }
      break;

      case 9:
      {
         Hour = "0" + Txt.substr( 0, 1 );
         Min  = Txt.substr( 1, 2 );
         Sec  = Txt.substr( 3, 2 );
         MSec = Txt.substr( 6, 3 );
      }
      break;

      case 8:
      {
         Hour = "00";
         Min  = Txt.substr( 0, 2 );
         Sec  = Txt.substr( 2, 2 );
         MSec = Txt.substr( 5, 3 );
      }
      break;

      case 7:
      {
         Hour = "00";
         Min  = "0" + Txt.substr( 0, 1 );
         Sec  = Txt.substr( 1, 2 );
         MSec = Txt.substr( 4, 3 );
      }
      break;

      case 6:
      {
         Hour = "00";
         Min  = "00";
         Sec  = Txt.substr( 0, 2 );
         MSec = Txt.substr( 3, 3 );
      }
      break;

      case 5:
      {
         Hour = "00";
         Min  = "00";
         Sec  = "0" + Txt.substr( 0, 1 );
         MSec = Txt.substr( 2, 3 );
      }
      break;

      case 4:
      {
         Hour = "00";
         Min  = "00";
         Sec  = "00";
         MSec = Txt.substr( 0, 3 );
      }
      break;

      default:
      {
         return GPSTime;
      }
      break;
   }

   Txt = Hour + ":" + Min + ":" + Sec + "." + MSec; 
   return Txt;
}

/*===========================================================================
METHOD:
   LatOrLongToString

DESCRIPTION:
   Convert latitude/longitude to a string in degrees/minutes/seconds format

PARAMETERS:
   Angle       [ I ] - Angle to be converted
   bLat        [ I ] - Latitude or Longitude

RETURN VALUE:
   Angle as string
===========================================================================*/
function LatOrLongToString( Angle, bLat )
{
   var bNeg = false;
   if (Angle < 0.0)
   {
      bNeg = true;
      Angle = 0.0 - Angle;
   }

   var Deg = new Number( Precision( Angle, 0, false ) );

   var Tmp = 60.0 * (Angle - Deg);
   var Min = new Number( Precision( Tmp, 0, false ) );

   var Sec = 60.0 * (Tmp - Min);

   var Dir = "";
   if (bNeg == false)
   {
      if (bLat == true)
      {
         Dir += "N ";
      }
      else
      {
         Dir += "E ";
      }
   }
   else
   {
      if (bLat == true)
      {
         Dir += "S ";
      }
      else
      {
         Dir += "W ";
      }
   }

   Tmp = Sec.toFixed( 2 );

   var Txt = Dir + Deg + "  " + Min + "  " + Tmp;
   return Txt; 
}

/*===========================================================================
METHOD:
   CourseToString

DESCRIPTION:
   Map GPS course to a string (N/S E/W)

PARAMETERS:
   Course       [ I ] - Course to be converted

RETURN VALUE:
   Course as string
===========================================================================*/
function CourseToString( Course )
{
   var Txt = "?";
   if (Course >= 0.0 && Course < 22.5)
   {
      Txt = "N";
   }
   else if (Course >= 22.5 && Course < 67.5)
   {
      Txt = "NE";
   }
   else if (Course >= 67.5 && Course < 112.5)
   {
      Txt = "E";
   }
   else if (Course >= 112.5 && Course < 157.5)
   {
      Txt = "SE";
   }
   else if (Course >= 157.5 && Course < 202.5)
   {
      Txt = "S";
   }
   else if (Course >= 202.5 && Course < 247.5)
   {
      Txt = "SW";
   }
   else if (Course >= 247.5 && Course < 292.5)
   {
      Txt = "W";
   }
   else if (Course >= 292.5 && Course < 337.5)
   {
      Txt = "W";
   }
   else if (Course < 360.0)
   {
      Txt = "N";
   }

   return Txt;
}

/*===========================================================================
METHOD:
   QualityToString

DESCRIPTION:
   Map GPS quality to a string

PARAMETERS:
   Qual       [ I ] - Quality to be converted

RETURN VALUE:
   Quality as string
===========================================================================*/
function QualityToString( Qual )
{
   var Txt = "?";
   switch (Qual)
   {
      case 0:
         Txt = "Invalid";
         break;

      case 1:
         Txt = "GPS Fix";
         break;

      case 2:
         Txt = "DGPS Fix";
         break;

      case 3:
         Txt = "PPS Fix";
         break;

      case 4:
         Txt = "RTK";
         break; 

      case 5:
         Txt = "Float RTK";
         break; 

      case 6:
         Txt = "Estimated";
         break; 

      case 7:
         Txt = "Manual";
         break; 

      case 8:
         Txt = "Simulated";
         break; 

      default:
         Txt = Qual;
   }

   return Txt;
}

/*===========================================================================
METHOD:
   ElapsedSecondsToString

DESCRIPTION:
   Map a value representing elapsed seconds to a string

PARAMETERS:
   Secs        [ I ] - Quality to be converted

RETURN VALUE:
   Elapsed seconds as string
===========================================================================*/
function ElapsedSecondsToString( Secs )
{
   var Sec = 0;
   var Min = 0;
   var Hr  = 0;
   var Txt = "";
      
   if (Secs < 60)
   {
      // Only seconds
      Sec = Secs;
      
      Txt += Sec;   
      if (Sec == 1)
      {
         Txt += " second";
      }
      else
      {
         Txt += " seconds";
      }
   }
   else if (Secs >= 60 && Secs < 3600)
   {
      // Only minutes and seconds
      Sec = Secs % 60;
      Min = Secs / 60;
      
      Min = Precision( Min, 0, false );
 
      Txt += Min;   
      if (Min == 1)
      {
         Txt += " minute";
      }
      else
      {
         Txt += " minutes";
      }
 
      if (Sec == 0)
      {
         Txt += ")";
      }
      else if (Sec == 1)
      {
         Txt += ",";
         Txt += Sec;
         Txt += " second";
      }
      else
      {
         Txt += ",";
         Txt += Sec;
         Txt += " seconds";
      }
   }
   else
   {
      // Hours, minutes, and seconds
      Sec = Secs % 60;
      Min = (Secs / 60) % 60;      
      Hr  = Secs / 3600;
      
      Min = Precision( Min, 0, false );
      Hr  = Precision( Hr, 0, false );
      
      Txt += Hr;   
      if (Hr == 1)
      {
         Txt += " hour";
      }
      else
      {
         Txt += " hours";
      }
         
      if (Min == 1)
      {
         Txt += ",";
         Txt += Min;
         Txt += " minute";
      }
      else if (Min > 1)
      {
         Txt += ",";
         Txt += Min;
         Txt += " minutes";
      }
 
      if (Sec == 0)
      {
         Txt += ")";
      }
      else if (Sec == 1)
      {
         Txt += ",";
         Txt += Sec;
         Txt += " second";
      }
      else
      {
         Txt += ",";
         Txt += Sec;
         Txt += " seconds";
      }     
   }
   
   return Txt;
}

/*===========================================================================
METHOD:
   GetQueryStringValue

DESCRIPTION:
   Get query string value for a specified field name

PARAMETERS:
   field        [ I ] - Field name

RETURN VALUE:
   Field value
===========================================================================*/
function GetQueryStringValue( field )
{
   var value = "";

   // Get query string and remove beginning '?' character   
   // decode UTF-8 URL
   var qs = unescape(window.location.search);
   qs = qs.substring(1);
   
   // Get queries by '&' character
   var queries = qs.split("&");
   for (var i = 0; i < queries.length; i++) 
   {
      // Get field/value pair by '=' character
      var pair = queries[i].split("=");
      if (pair[0] == field)
      {
         value = pair[1];
         break;
      }
   }

   return value;
}
