/*===========================================================================
FILE: 
   ISFToText.cs

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
// Using Statements
//---------------------------------------------------------------------------
using System;
using System.IO;
using DMCoreAutomation;

namespace ISFToText
{
   class Program
   {
      //-----------------------------------------------------------------------
      // Definitions
      //-----------------------------------------------------------------------
      const ulong ITEM_TYPE_EVENT = 4;
      const ulong ITEM_TYPE_MESSAGE = 6;

      /*=======================================================================
      METHOD:
         Main
 
      DESCRIPTION:
         Application entry point

      PARAMETERS:
         args        [ I ] - Array of arguments:
                                [0] InputFile.isf
                                [1] OutputFile.txt
  
      RETURN VALUE:
         int:  -1 - Error
                0 - Success
      =======================================================================*/
      static void Main( string[] args )
      {
         // Check argument count
         if (args.Length != 2)
         {
            Console.WriteLine( "Error:  Invalid parameters.  Use following format:" );
            Console.WriteLine( "ISFToText.exe C:\\InputFile.isf C:\\OutputFile.txt" );
            return;
         }

         // Initialize ISF interface
         ItemStoreFilesClass iisf = new ItemStoreFilesClass();
         if (iisf == null)
         {
            Console.WriteLine( "Error:  Failed to initialize ISF interface" );
         }

         // Load ISF file
         uint hISF = iisf.LoadItemStore( args[0] );
         if (hISF == 0xFFFFFFFF)
         {
            Console.WriteLine( "Error:  Failed to load input ISF: {0}", args[0] );
            return;
         }

         // Open text file
         FileStream fs;
         StreamWriter sw;
         try
         {
            fs = new FileStream( args[1], 
                                 FileMode.Create, 
                                 FileAccess.Write, 
                                 FileShare.Read );

            sw = new StreamWriter( fs );
         }
         catch (Exception)
         {
            Console.WriteLine( "Error:  Failed to open output file: {0}", args[1] );
            return;
         }

         // Write a header for the file
         sw.WriteLine( "ISF TO TEXT" );
         sw.WriteLine( "ISF FILE NAME:  {0}", args[0] );
         sw.WriteLine( "" );

         // Process all items in ISF
         uint itemCount = iisf.GetItemCount( hISF );
         for (uint i = 0; i < itemCount; i++)
         {
            // Get the item
            ColorItem iitem = (ColorItem)iisf.GetItem( hISF, i );
            if (iitem == null)
            {
               // Failed to get the item
               Console.WriteLine( "Error:  Failed to get item: {0}", i );

               // Close files and exit
               iisf.CloseItemStore( hISF );
               sw.Close();
               fs.Close();
               return;
            }

            string tsTxt = iitem.GetItemTimestampText( true, true );
            string itTxt = iitem.GetItemTypeText();
            string ikTxt = iitem.GetItemKeyText();
            string inTxt = iitem.GetItemName();
            string isTxt = iitem.GetItemSummary();

            // Write the first line for the item
            sw.WriteLine( "{0,-23}   {1,-10}   {2,-18}   {3,-25}   {4}",
                          tsTxt,
                          itTxt,
                          ikTxt,
                          inTxt,
                          isTxt );


            // Check the item for parsed text
            string parsedTxt = iitem.GetItemParsedText();
            if (parsedTxt.Length != 0)
            {
               // Write the parsed text
               sw.WriteLine( "{0}", parsedTxt);
               sw.WriteLine( "" );

            }
            else if ( (iitem.GetItemType() != ITEM_TYPE_EVENT)
                 &&   (iitem.GetItemType() != ITEM_TYPE_MESSAGE) )
            {
               // No parsed text, get any fields that may exist
               ColorItemFields ifields = (ColorItemFields)iitem.GetItemFields();
               if (ifields != null)
               {
                  // Write all of the item's field names and values
                  uint fieldCount = ifields.GetFieldCount();
                  for (uint j = 0; j < fieldCount; j++)
                  {
                     string fnTxt = ifields.GetFieldName( j, true );
                     string fvTxt = ifields.GetFieldValueText( j );

                     sw.WriteLine( "{0,-40}   {1}",
                                   fnTxt,
                                   fvTxt );
                  }

                  if (fieldCount > 0)
                  {
                     sw.WriteLine( "" );
                  }
               }
            }
         }

         Console.WriteLine( "ISF successfully converted to text" );

         // Close files and exit
         iisf.CloseItemStore( hISF );
         sw.Close();
         fs.Close();
      }
   }
}
