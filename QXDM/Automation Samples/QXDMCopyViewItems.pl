# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMCopyViewItems.pl

# This script demostrates usage of the QXDM2 automation
# interface method CopyViewItems

use HelperFunctions;

# Global variables
my $QXDM;
my $QXDM2;

# Initialize application
sub Initialize
{
   # Assume failure
   my $RC = false;

   # Create QXDM object
   $QXDM = new Win32::OLE 'QXDM.Application';
   if ($QXDM == null)
   {
      print "\nError launching QXDM";

      return $RC;
   }

   # Create QXDM2 interface
   $QXDM2 = $QXDM->GetIQXDM2();
   if ($QXDM2 == null)
   {
      print "\nQXDM does not support required interface";

      return $RC;
   }

   SetQXDM ( $QXDM );
   SetQXDM2 ( $QXDM2 );

   # Success
   $RC = true;
   return $RC;
}

# Copy all items from "Command Output" view to an item store file
sub CopyViewItems
{
   # Assume failure
   my $RC = false;

   # Create the view first
   $RC = $QXDM->CreateView( "Command Output", "" );
   if ($RC == false)
   {
      print "\nFailed to create 'Command Output' view";

      return;
   }

   # Get file name from script folder path
   my $FileName = GenerateFileName( "", ".isf" );
   if ($FileName eq "")
   {
      return;
   }

   # Add and item to item store that will end up in the output view
   $QXDM->QXDMTextOut( "Test string" );

   # Copy all items from command output
   $RC = $QXDM->CopyViewItems( "Command Output", $FileName );
   if ($RC == false)
   {
      print "\nUnable to copy items\n";

      return;
   }

   print "\nItems copied to item store file:\n"
       . "$FileName\n";
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

   # Get QXDM version
   my $Version = $QXDM->{AppVersion};
   print "\nQXDM Version: " . $Version;

   # Copy all items from "Command Output"
   # view to an item store file
   CopyViewItems();
}

Execute();