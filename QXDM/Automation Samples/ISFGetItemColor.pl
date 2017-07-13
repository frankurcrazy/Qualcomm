# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetItemColor.pl

# This script demostrates usage of the IColorItem automation
# interface method GetItemColor()

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

# Dump the color of an item
sub DumpItemColor
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

   my $ItemColor = $Item->GetItemColor();
   if ($ItemColor == 0)
   {
      print "\nError getting color of item\n";
      return;
   }

   my $R = $ItemColor & 0xFF;
   my $G = ($ItemColor & 0xFF00) >> 8;
   my $B = ($ItemColor & 0xFF0000) >> 16;
   my $ItemName = $Item->GetItemName();

   print "\nColor of item "
       . " \'" . $ItemName . "\'" . " is "
       . "( " . $R . ", " . $G . ", " . $B . " )\n";
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

   # Dump the color of an item
   DumpItemColor();
}

Execute();