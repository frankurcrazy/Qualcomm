# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetFieldIndexFrom.pl

# This script demostrates usage of the IItemFields automation
# interface method GetFieldIndexFrom()

use HelperFunctions;

# Global variable
my $IISF;

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create the item store file interface
   $IISF = new Win32::OLE 'DMCoreAutomation.ItemStoreFiles';
   if (!$IISF)
   {
      print "\nUnable to obtain ISF interface\n";

      return $RC;
   }

   # Success
   $RC = true;
   return $RC;
}

# Get file name from script folder path
sub GetFileName
{
   my $FileName = "";
   my $FolderPath = GetPathFromScript();

   # Item store file name
   $FileName = $FolderPath . "Example.isf";
   return $FileName;
}

# Get the index of a parsed field
sub GetFieldIndexFrom
{
   # Generate item store file name
   my $FileName = GetFileName();
   if ($FileName eq "")
   {
      return;
   }

   # Load the item store file
   my $Handle = $IISF->LoadItemStore( $FileName );
   if ($Handle == 0xFFFFFFFF)
   {
      print "\nUnable to load ISF:\n$FileName\n";
      return;
   }

   # Retrieve item from example ISF
   my $Item = $IISF->GetItem( $Handle, 2 );
   if ($Item == null)
   {
      print "\nUnable to retrieve item\n";
      return;
   }

   my $Fields = $Item->GetItemFields();
   if ($Fields == null)
   {
      print "\nUnable to retrieve fields for item\n";
      return;
   }

   my $Loop = false;
   my $Index = 0;
   my $Partial = true;
   my $FieldName = "Mobile CAI Revision";
   my $FieldIndex = $FieldIndex = $Fields->GetFieldIndexFromByID( $FieldName, $Index, $Partial, $Loop );
   if ($FieldIndex == 0xFFFFFFFF)
   {
         print "\nError getting index for field '" . $FieldName . "'\n";
   }
   else
   {
      print "\nIndex of field '" . $FieldName . "'" . " is " . $FieldIndex;
   }

   # We expect this one to fail since we are searching past the
   # actual index without looping
   $Index = 7;
   $FieldIndex = $Fields->GetFieldIndexFrom( $FieldName, $Index, $Partial, $Loop );
   if ($FieldIndex == 0xFFFFFFFF)
   {
      print "\nError getting index for field '" . $FieldName . "' (expected)";
   }
   else
   {
      print "\nIndex of field '" . $FieldName . "'" . " is " . $FieldIndex . "\n";
   }

   # If we add looping it should succeed
   $Loop = true;
   $FieldIndex = $Fields->GetFieldIndexFrom( $FieldName, $Index, $Partial, $Loop );
   if ($FieldIndex == 0xFFFFFFFF)
   {
      print "\nError getting index for field '" . $FieldName . "'\n";
   }
   else
   {
      print "\nIndex of field '" . $FieldName . "'" . " is " . $FieldIndex . "\n";
   }
}

# Main body of script
sub Execute
{
   # Launch QXDM
   my $RC = Initialize();
   if ($RC == false)
   {
      return;
   }

   # Get the index of a parsed field
   GetFieldIndexFrom();
}

Execute();