#Welcome to the SAP HANA Cloud Platform, Portal Service Samples GitHub Repository

The SAP HCP portal service samples repository provides code samples of site and page templates, applications, widgets, shell plugins and more, intended to be used as references for development of custom content for portal service sites.

##Important Disclaimers on Security and Legal Aspects

This document is for informational purposes only. Its content is subject to change without notice, and SAP does not warrant that it is error-free. SAP MAKES NO WARRANTIES, EXPRESS OR IMPLIED, OR OF MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.

**Information Security**

Your portal service system may (and most probably will) contain personal and confidential data. Make sure to connect ONLY trusted sample applications which deal with such data accordingly and comply to the security requirements of your organization. NEVER connect random or untrusted sample applications neither to your productive, nor to your test portal service system.

**Coding Samples**

Any software coding and/or code lines / strings ("Code") included in this documentation are only examples and are not intended to be used in a productive system environment. The Code is only intended to better explain and visualize the syntax and phrasing rules of certain coding. SAP does not warrant the correctness and completeness of the Code given herein, and SAP shall not be liable for errors or damages caused by the usage of the Code.

##License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

##Widgets for SAP HCP Portal Service Freestyle Sites##

You can use SAP HCP portal service sample widgets to enhance your portal service sites. Following is a description of the available widgets on SAP's portal service GitHub account, to which you can refer as an example of the various enhancements you can achieve by customizing widgets.

* SAP Jam: Embed content from SAP Jam into your site pages, to bring to front your community activity, to share the knowledge of experts, and for team support and engagement. These are the available sample widgets for embedding SAP Jam content in your freestyle site:
 * Group feed: After adding this widget to your site, configure the SAP Jam tenant and the group whose feed will be featured in the site page.
 * Search: After adding this widget to your site, in the Site Designer, you can define a default query, the results of which will appear on the page before the user performs the first search.

> Note: When using an SAP HANA Cloud Platform trial account, you enable the SAP Jam services in the cockpit, under Services. For information on the initial configuration of SAP Jam, see [Use the SAP Jam API to access data via OData](http://help.sap.com/download/documentation/sapjam/developer/index.html#hcp/concepts/ADVANCED_TOPICS-API_integrate_features_data.html)

* Side Navigation: This widget uses the SAPUI5 side navigation control. Side navigation is available both as a widget and as a plugin. The widget supports up to two levels of page hierarchy. A widget side navigation menu would appear in specific pages, whereas a plugin side navigation menu is always available. For information regarding the side navigation plugin, see Plugins for SAP HCP Portal Service Freestyle Sites

* Video: You can embed any standard YouTube URL in a site page using this widget. In the Site Designer, after adding the widget to a page, open the widget settings screen to enter the URL and the height of the video's frame.

* Breadcrumbs: Shows the position of the current page in the site hierarchy, allowing the user to click on any of its parent pages, for convenient navigation.

* SCI Login: When added to a page, this widget generates an SCI login overlay (popup), or redirects to a login screen. It is typically used in pages with restricted content, or employee-only areas. After the user logs in, the browser is refreshed and he or she can access content according to their role-based access definitions. When adding this widget to a site, some configuration is required of the developer. In the widget root folder, in the manifest.json file, under the sap.ui5 section, define the following:
 * Enter the SCI tenant
 * Optional: Set the overlay option to "true" to determine that the login opens as a popup, and the user is not redirected to a login page.

```
"config": {
    "sci": {
        "useOverlay": true,
        "sci_tenant": "https://flplto.accounts.ondemand.com",
        "sap_ids_path": "/ui/resources/javascripts/SAP_IDS.js"
    }
},
```

* Map: Use this widget to embed a map in a site page, for example: create a page for an end-of-year event, and embed a map with the event location. In the Site Designer, after adding the widget, open the widget settings screen and enter the location name, longitude and latitude. In the same screen, you can also select whether the map will remain embedded in the page when users zoom in and click around, or whether it will open as an overlay popup.

* Social Networks: Add quick links to your company's social pages, each with its own instantly recognizable icon (e.g. Twitter, Facebook). In the Site Designer, after adding the widget, open the widget settings screen, enable the relevant social network and enter the URL of your company's page there. At runtime, users will click on the icons to access your pages.

##Plugins for SAP HCP Portal Service Freestyle Sites##

You can use SAP HCP portal service sample plugins to enhance your portal service sites. Following is a description of the available plugins on SAP's portal service GitHub account, to which you can refer as an example of the various enhancements you can achieve by customizing plugins.

* Side Navigation: This plugin uses the SAPUI5 side navigation control. Side navigation is available both as a widget and as a plugin. The plugin supports up to two levels of page hierarchy. A plugin side navigation menu is always available to users, whereas a plugin would appear only in specific pages. For information regarding the side navigation widget, see Widgets for SAP HCP Portal Service Freestyle Sites

* SCI Login: When added to a site, this plugin generates an SCI login overlay (popup), or redirects to a login screen. It is typically used in sites with restricted content. After the user logs in, the browser is refreshed and he or she can access content according to their role-based access definitions. When adding this plugin to a site, some configuration is required of the developer. In the plugin root folder, in the manifest.json file, under the sap.ui5section, define the following:
 * Enter the SCI tenant
 * Optional: Set the overlay option to "true" to determine that the login opens as a popup, and the user is not redirected to a login page.

```
"config": {
    "sci": {
        "useOverlay": true,
        "sci_tenant": "https://flplto.accounts.ondemand.com",
        "sap_ids_path": "/ui/resources/javascripts/SAP_IDS.js"
    }
},
```

* Horizontal Navigation Menu: This menu displays your site pages in a horizontal bar. The plugin supports up to three levels of page hierarchy.

##SAP HCP Portal Service Sample Site Templates##

SAP HCP portal service site templates are offered as a demonstration of some of the capabilities available for both developers and administrators. While they are not intended to be used out of the box, they may spark ideas. You can use them to view how different page templates and pages would appear to users.

* Marketing Site: This site template contains marketing-related content. It is built mostly using HTML widgets. You can view the project structure in SAP Web IDE, and preview the site from there, or from the Site Designer.

* Parallax Site: A site template which implements many types of parallax scrolling effects and transitions in the sample "Parallax Page", built of portal service widgets. A prerequisite for working with the parallax site is deployment of the social networks widget, also available in the SAP HCP portal service GitHub account.

    The first parallax element includes a built-in editor for choosing between an image and a video, setting the pace of the scroll and the image/video alignment. The other elements which make up the scrolling effects can be configured in SAP Web IDE. For more information on configuring the parallax site template, see [this blog post](http://scn.sap.com/community/hana-cloud-portal/blog/2016/05/05/customizing-a-parallax-page-in-sap-hana-cloud-portal).