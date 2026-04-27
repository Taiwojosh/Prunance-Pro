## WHAT I OBSERVED AFTER TESTING THE APP ON MY DEVICE (ITEl A80)
-Dial message signals to my users that the app is a web app that is not professional enough I think we need to solve that
- the quick add should be collapsed it's taking up too much space,
- the note field should be more visible
- I need you to remove add coded splash screen (the blue background one) because now capacitor's the splash screen has been disabled and the new splash screen is this playing the way it should but I guess the apps add coded splash screen is also displaying
- the status bar at the top of your phone should now match/blend with the system color(dark or light, making the app feel much more native and "Pro.") on which the app needs to detect whether a system is in dark mode or light mode so that the status bar displays the system color(dark or light, making the app feel much more native and "Pro."). 
Removed the "uncool" orange focus outlines. Text fields now use a subtle, modern blue glow when selected.
- now I still notice that the my notifications are too persistent, one notification message occurs twice in face four times in quick succession
- the moment you exit the app and come back to the app your setup profile vanishes meaning that all the data you've entered is lost. Your name, your preferred currency, your low balance threshold, your PD, your monthly income etc. are all gone
- the current implementation of the notification logic has a flaw when it comes to user expectations. Users typically want to be able to dismiss or act on notifications individually. The current setup does not seem to offer this functionality.
- I want the notification icon to click on the app's original icon
- the quick tour opens every time i opened the app, which should only be the first time except the user clears their storage I guess that is why the user setup close because the app he is expecting the users set up from the first time he opened the app(quick tour) which is bad, the app is now seeing itself as a new app and opening the quick tour again.
- they "secure your data" suggestion should be as a notification such that users can interact with it and takes them exactlydirectly to the settings page do you set pin code position (I need this to be a notification because it's too important and the user can't afford to miss it)

What has resolved these issues first then I will continue testing and to I know we are ready to launch to google play store I'll give you the final go ahead.