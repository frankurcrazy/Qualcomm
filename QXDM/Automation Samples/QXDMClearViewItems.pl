# NOTE: This script must be run with Perl in a command box,
# i.e.  Perl QXDMClearViewItems.pl

# This script demostrates usage of the QXDM automation
# interface method ClearViewItems

use HelperFunctions;

# Global variable
my $QXDM;

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

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
}


# Clear the item view
sub ClearViewItems
{
   # Assume failure
   my $RC = false;

   # Create the view first
   $RC = $QXDM->CreateView( "Item View", "" );
   if ($RC == false)
   {
      print "\nFailed to create \'Item View\'";

      return;
   }

   # Clear the view
   $RC = $QXDM->ClearViewItems( "Item View" );
   if ($RC == false)
   {
      print "\nCannot clear view \'Item View\'";

      return;
   }

   print "\n\'Item View\' successfully cleared\n";
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

   # Client the item view
   ClearViewItems();
}

Execute();