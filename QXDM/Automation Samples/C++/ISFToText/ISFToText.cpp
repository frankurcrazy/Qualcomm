/*===========================================================================
FILE: 
   ISFToText.cpp

DESCRIPTION:
   Implementation of ISF To Text application, used to extract information 
   from an ISF file to a text file

Copyright (C) 2007 QUALCOMM Incorporated. All rights reserved.
                   QUALCOMM Proprietary/GTDR

All data and information contained in or disclosed by this document is
confidential and proprietary information of QUALCOMM Incorporated and all
rights therein are expressly reserved.  By accepting this material the
recipient agrees that this material and the information contained therein
is held in confidence and in trust and will not be used, copied, reproduced
in whole or in part, nor its contents revealed in any manner to others
without the express written permission of QUALCOMM Incorporated.
==========================================================================*/

//---------------------------------------------------------------------------
// Include Files
//---------------------------------------------------------------------------
#include "Stdafx.h"
#import "C:\\Program Files\\Qualcomm\\QXDM\\Bin\\CoreAutomation.dll" 

//---------------------------------------------------------------------------
// Definitions
//---------------------------------------------------------------------------
const ULONG ITEM_TYPE_EVENT = 4;
const ULONG ITEM_TYPE_MESSAGE = 6;

/*=========================================================================*/
// Free Methods
/*=========================================================================*/

/*===========================================================================
METHOD:
   _tmain
 
DESCRIPTION:
   Application entry point

PARAMETERS:
   argc        [ I ] - Number of arguments
   argv        [ I ] - Array of arguments:
                          [0] ISFToText.exe
                          [1] InputFile.isf
                          [2] OutputFile.txt
  
RETURN VALUE:
   int:  -1 - Error
          0 - Success
===========================================================================*/
int _tmain( 
   int                        argc, 
   _TCHAR *                   argv[] )
{
   // Check argument count
   if (argc != 3)
   {
      _tprintf_s( _T("Error:  Invalid parameters.  Use following format:\n")
                  _T("ISFToText.exe C:\\InputFile.isf C:\\OutputFile.txt\n") );
      return -1;
   }

   // Initialize COM library
   HRESULT hr = CoInitialize( 0 );
   if (FAILED( hr )) 
   {
      _tprintf_s( _T("Error:  Failed to initialize COM library\n") );
      return -1;
   }

   // Initialize QXDM interface
   DMCoreAutomation::IItemStoreFilesPtr pISF(
      __uuidof( DMCoreAutomation::ItemStoreFiles ) );

   if (pISF == 0)
   {
      _tprintf_s( _T("Error:  Failed to initialize ISF interface\n") );
      return -1;
   }

   // Load ISF file
   ULONG hISF = pISF->LoadItemStore( argv[1] );
   if (hISF == 0xFFFFFFFF)
   {
      _tprintf_s( _T("Error:  Failed to load input ISF: %s\n"), argv[1] );
      return -1;
   }

   // Open text file
   FILE * fp = 0;
   errno_t ec = _tfopen_s( &fp, argv[2], _T("w") );
   if (ec != 0 || fp == 0)
   {
      _tprintf_s( _T("Error:  Failed to open output file: %s\n"), argv[2] );
      return -1;
   }
   
   // Write a header for the file
   _ftprintf_s( fp, _T("ISF TO TEXT\n") );
   _ftprintf_s( fp, _T("ISF FILE NAME:  %s\n\n"), argv[1] );

   // Process all items in ISF
   ULONG itemCount = pISF->GetItemCount( hISF );
   for (ULONG i = 0; i < itemCount; i++)
   {
      // Get the item
      DMCoreAutomation::IColorItemPtr pItem = pISF->GetItem( hISF, i );
      if (pItem == 0)
      {
         // Failed to get the item
         _tprintf_s( _T("Error:  Failed to get item: %u\n"), i );

         // Close files and exit
         pISF->CloseItemStore( hISF );
         fclose( fp );
         return -1;
      }

      _bstr_t tsTxt = pItem->GetItemTimestampText( VARIANT_TRUE, VARIANT_TRUE );
      _bstr_t itTxt = pItem->GetItemTypeText();
      _bstr_t ikTxt = pItem->GetItemKeyText();
      _bstr_t inTxt = pItem->GetItemName();
      _bstr_t isTxt = pItem->GetItemSummary();

      // Write the first line for the item
      _ftprintf_s( fp, 
                   _T("%-23s   %-10s   %-18s   %-25s   %s\n"), 
                   (LPCTSTR)tsTxt, 
                   (LPCTSTR)itTxt, 
                   (LPCTSTR)ikTxt, 
                   (LPCTSTR)inTxt, 
                   (LPCTSTR)isTxt );

      // Check the item for parsed text
      _bstr_t parsedTxt = pItem->GetItemParsedText();
      if (parsedTxt.length() != 0)
      {
         // Write the parsed text
         _ftprintf_s( fp, _T("%s\n\n"), (LPCTSTR)parsedTxt );
      }
      else if ( (pItem->GetItemType() != ITEM_TYPE_EVENT) 
           &&   (pItem->GetItemType() != ITEM_TYPE_MESSAGE) )
      {
         // No parsed text, get any fields that may exist
         DMCoreAutomation::IColorItemFieldsPtr pFields = pItem->GetItemFields();
         if (pFields != 0)
         {
            // Write all of the item's field names and values
            ULONG fieldCount = pFields->GetFieldCount();
            for (UINT j = 0; j < fieldCount; j++)
            {
               _bstr_t fnTxt = pFields->GetFieldName( j, TRUE );
               _bstr_t fvTxt = pFields->GetFieldValueText( j );

               _ftprintf_s( fp, 
                            _T("%-40s   %s\n"), 
                            (LPCTSTR)fnTxt, 
                            (LPCTSTR)fvTxt );
            }

            if (fieldCount > 0)
            {
               _ftprintf_s( fp, _T("\n") );
            }
         }
      }
   }

   _tprintf_s( _T("ISF successfully converted to text\n") );

   // Close files and exit
   pISF->CloseItemStore( hISF );
   fclose( fp );

   return 0;
}