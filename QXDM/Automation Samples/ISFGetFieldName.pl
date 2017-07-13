# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetFieldName.pl

# This script demostrates usage of the IItemFields automation
# interface method GetFieldName()

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

# Get the name of a parsed field
sub GetFieldName
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

   my $Partial = true;
   my $FieldID = 6;
   my $FieldName = $Fields->GetFieldName( $FieldID, $Partial );
   if ($FieldName eq "")
   {
      print "\nError getting partial name for field " . $FieldID . "\n";
   }
   else
   {
      print "\nPartial name of field " . $FieldID . " is '$FieldName'";
   }

   $Partial = false;
   $FieldName = $Fields->GetFieldName( $FieldID, $Partial );
   if ($FieldName eq "")
   {
      print "\nError getting full name for field " . $FieldID . "\n";
   }
   else
   {
      print "\nFull name of field " . $FieldID . " is '$FieldName'\n";
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

   # Get the name of a parsed field
   GetFieldName();
}

Execute();