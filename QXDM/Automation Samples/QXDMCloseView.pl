# NOTE: This script must be run from a command box, 
# i.e.  Perl QXDMCloseView.pl

# This script demostrates usage of the QXDM automation
# interface method CloseView

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
   }

   SetQXDM( $QXDM );

   # Success
   $RC = true;
   return $RC;
}

# Open/close QXDM views
sub ManipulateViews
{
   # Assume failure
   my $RC = false;

   # Create the view first
   $RC = $QXDM->CreateView( "Item View", "" );
   if ($RC == false)
   {
      print "\nFailed to create 'Item View'";

      return;
   }

   print "\n'Item View' successfully created\n";

   # Display item view to user
   sleep( 3 );   

   # Close the item view
   $RC = $QXDM->CloseView( "Item View", "" );
   if ($RC == false)
   {
      print "\nCannot close view 'Item View'";

      return;
   }

   print "'Item View' successfully closed\n";

   # Create the view which supports multiple instances and
   # tag this view as "Client View"
   $RC = $QXDM->CreateView( "Filtered View", "Client View" );
   if ($RC == false)
   {
      print "\nFailed to create 'Filtered View {Client View}'";

      return;
   }

   print "'Filtered View {Client View}' successfully created\n";

   # Display filtered view to user
   sleep( 3 );   

   # Close the filtered view
   $RC = $QXDM->CloseView( "Filtered View", "Client View" );
   if ($RC == false)
   {
      print "\nCannot close view 'Filtered View {Client View}'";

      return;
   }

   print "'Filtered View {Client View}' successfully closed\n";
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

   # Open/close QXDM views
   ManipulateViews();
}

Execute();