# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetFieldIndexFromByID.pl

# This script demostrates usage of the IItemFields automation
# interface method GetFieldIndexFromByID()

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

# Get field index by using field ID searching from specified index
sub GetFieldIndexFromByID
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
   my $Item = $IISF->GetItem( $Handle, 3 );
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

   # Loop finding all scrambling code indices (by field ID)
   my $Loop = false;
   my $Index = 0;
   my $Found = 0;
   my $FieldID = 21828;
   my $FieldIndex = 0;
   while ($FieldIndex != 0xFFFFFFFF)
   {
      $FieldIndex = $Fields->GetFieldIndexFromByID( $FieldID, $Index, $Loop );
      if ($FieldIndex != 0xFFFFFFFF)
      {
         print "\n" . $Fields->GetFieldName( $FieldIndex, true )
             . " = " . $Fields->GetFieldValue( $FieldIndex );

         $Found++;
         $Index = $FieldIndex + 1;
      }
   }

   print "\n";

   # We expect to find four such fields
   if ($Found != 4)
   {
      print "\nError getting index for field ID " . $FieldID . "\n";
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

   # Get the index of a parsed field (by ID)
   GetFieldIndexFromByID();
}

Execute();