# Nowports Assistant

## Project Description

Nowports Assistant is an interactive customer support solution that uses intelligent chat technology to facilitate communication between logistics service users and the Nowports platform. This assistant allows customers to make inquiries about shipments, get real-time updates, manage documentation, and connect with human agents when necessary.

## Main Features

- **Interactive Chat**: Intuitive conversational interface with markdown support.
- **Shipment Tracking**: Graphical visualization of shipment status and location.
- **WhatsApp Notifications**: Configuration of alerts to receive real-time updates.
- **Quick Replies**: Predefined options to facilitate user interaction.
- **Multilingual**: Support for multiple languages (initially Spanish and English).
- **Dark/Light Mode**: Interface adaptable to user preferences.
- **Executive Integration**: Direct connection with human agents when personalized attention is required.

## Data Types and Modeling

The application uses an efficient and scalable data structure:

### Messages and Chat
- `ChatMessage`: Main structure for messages that includes:
  - Text content (with Markdown support)
  - Attachments (documents, images)
  - Quick replies
  - Tracking visualizations
  - Agent/executive data
  - WhatsApp alert information

### Shipment Tracking
- `TrackingVisualization`: Visual representation of shipment status:
  - Origin and destination points (coordinates and names)
  - Current location
  - Journey milestones with statuses (completed/in progress/pending)
  - Carrier and container information
  - Estimated arrival dates

### Notifications
- `WhatsAppAlertData`: Configuration for mobile notifications:
  - Phone number and personalized message
  - Notification type (status, arrival, delay, documents)
  - Related shipment ID

### Assisted Interaction
- `QuickReply`: Interactive options for quick response
- `CustomerAgentData`: Assigned executive information
- `DocumentAttachment`: Structure for attached documents

## Screenshots / Interfaces

### Main View
```
+----------------------------------+
|         Nowports Assistant       |
+----------------------------------+
|                                  |
|  +------------------------------+|
|  |                              ||
|  |        Chat Interface        ||
|  |                              ||
|  +------------------------------+|
|                                  |
|  +------------------------------+|
|  |                              ||
|  |       Information Panel      ||
|  |                              ||
|  +------------------------------+|
|                                  |
+----------------------------------+
```

### Shipment Tracking
```
+----------------------------------+
|      Shipment #MSKU7627321      |
+----------------------------------+
|                                  |
|  +-Origin--------Destination-+  |
|  |   O=====[SHIP]=======>O   |  |
|  +--------------------------+  |
|                                  |
|  +--------- Timeline ---------+  |
|  | ● Pickup       [Completed] |  |
|  | ● In transit   [In progress]  |
|  | ○ Arrival      [Pending]   |  |
|  | ○ Delivery     [Pending]   |  |
|  +--------------------------+  |
|                                  |
+----------------------------------+
```

### WhatsApp Notifications
```
+----------------------------------+
|      WhatsApp Alerts             |
+----------------------------------+
|                                  |
|  Phone: +52 123 4567 8901        |
|                                  |
|  [Notification Example]          |
|  +------------------------------+|
|  | Your shipment MSKU7627321    ||
|  | has arrived at Long Beach    ||
|  | port. Customs clearance will ||
|  | begin in the next 24 hours.  ||
|  +------------------------------+|
|                                  |
|  [ Close ]    [ Open WhatsApp ]  |
+----------------------------------+
```

## Feasibility and Usability

### Technical Feasibility
- **Frontend Implementation**: Built with Next.js and TypeScript to ensure robustness and type safety.
- **Responsive Design**: Works on mobile and desktop devices thanks to Tailwind CSS.
- **Service Integration**: Ready to connect to tracking APIs, notifications, and document management.
- **Scalability**: Modular architecture that allows adding new functionalities without affecting existing ones.

### Usability
- **Intuitive Design**: Natural conversational interface that requires no special learning.
- **Quick Replies**: Minimizes user typing by offering contextually relevant predefined options.
- **Clear Visualizations**: Graphical representation of shipment status for better understanding.
- **Accessibility**: Support for dark mode and translation into multiple languages.
- **Contact Options**: Smooth transition between automated assistant and human attention.

### Business Value
- **Reduced Workload**: Decreases the need for telephone support for basic inquiries.
- **24/7 Availability**: Offers continuous assistance to customers in any time zone.
- **Personalization**: Adapts responses according to the customer's context and history.
- **Proactive Notifications**: Informs customers about important events without waiting for them to inquire.

## Technologies Used

- **Frontend**: Next.js, React, TypeScript
- **Styles**: Tailwind CSS
- **Internationalization**: next-i18next
- **Markdown Visualization**: react-markdown

## Installation and Usage

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build

# Start in production
npm start
```

## Next Steps

- Integration with Nowports' real tracking APIs
- Implementation of user authentication
- Expand AI capabilities for more complex responses
- Add more languages and regional customization
- Develop widgets for integration into third-party sites

## Credits and Tools

This project was developed with the assistance of Artificial Intelligence tools, which facilitated and accelerated the creation process. We especially thank:

* **Google Gemini**: Used as a language model for generating intelligent responses in the chat assistant and for iterating and improving the solution design.
* **IDX (Google Cloud Workstations)**: Cloud development environment that provided an efficient and accessible programming environment for building this project.

The use of these AI tools allowed us to focus on logic and user experience, optimizing development time and exploring innovative solutions.
