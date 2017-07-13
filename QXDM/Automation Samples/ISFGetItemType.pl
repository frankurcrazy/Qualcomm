# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl ISFGetItemType.pl

# This script demostrates usage of the IColorItem automation
# interface method GetItemType()

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

# Dump the type of an item
sub DumpItemType
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

   my $Type = $Item->GetItemType();
   if ($Type == 0xFFFFFFFF)
   {
      print "\nUnable to retrieve item type\n";
      return;
   }

   my %Types = (
      0 => "'DIAG Malformed Packet'",
      1 => "'DIAG Response'",
      2 => "'DIAG Request'",
      3 => "'GPS Report'",
      4 => "'Event Report'",
      5 => "'Log Packet'",
      6 => "'Message Packet'",
      7 => "'String'",
      8 => "'Log Packet (OTA)'",
      9 => "'Subsystem Dispatch Response'",
      10 => "'Subsystem Dispatch Request'",
   );

   my $TypeStr = "'Unknown'";
   if (defined $Types{$Type})
   {
      $TypeStr = $Types{$Type};
   }

   $TypeStr .= " (" . $Type . ")";

   print "\nItem type is " . $TypeStr . "\n";
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

   # Dump the type of an item
   DumpItemType();
}

Execute();