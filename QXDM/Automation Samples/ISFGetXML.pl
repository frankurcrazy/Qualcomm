# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetXML.pl

# This script demostrates usage of the IItemFields automation
# interface method GetXML()

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

# Get the value for a parsed field
sub GetXML
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

   my $FieldTxt = $Fields->GetXML();
   if ($FieldTxt eq "")
   {
      print "\nError getting XML representation of fields\n";
   }
   else
   {
      print "\nXML representation of fields is\n" . $FieldTxt . "\n";
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

   # Get the value for a parsed field
   GetXML();
}

Execute();