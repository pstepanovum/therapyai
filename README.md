# TherapAI

## Modern Therapy Sessions with AI-Powered Insights

![TherapAI Logo](public/web-app-manifest-192x192.png)

TherapAI is a cutting-edge platform that bridges the gap between mental health professionals and their patients through technology. By recording, transcribing, and summarizing therapy sessions, TherapAI provides valuable insights and reference points that enhance the therapeutic journey.

## 🧠 About TherapAI

TherapAI was born from the recognition that both therapists and patients often struggle to remember important details from previous sessions. Therapists managing 20+ patients weekly can miss crucial information, while patients rarely take comprehensive notes during their sessions. TherapAI solves this problem by creating a secure, AI-enhanced system that captures, analyzes, and organizes therapy sessions for improved continuity of care.

## ✨ Features

### For Patients
- **Personalized Dashboard**: Access all previous sessions, messages, and journaling prompts
- **Session History**: Review AI-generated summaries, key points, and insights from past sessions
- **Journaling**: Respond to therapist-assigned journaling prompts
- **Appointment Scheduling**: Easily book and manage therapy appointments
- **Secure Messaging**: Direct communication with your therapist
- **Pattern Recognition**: View emerging patterns from your therapy journey
- **Video Sessions**: Join secure video calls with your therapist

### For Therapists
- **Patient Management**: Organize and access information for all patients
- **Session Tools**: Record, review, and reference past therapy sessions
- **AI Summaries**: Automatically generated session summaries, key points, and insights
- **Journaling Assignments**: Create and track patient journaling exercises
- **Calendar Integration**: Manage your appointment schedule
- **Secure Communications**: Message patients within the platform
- **Progress Tracking**: Monitor patient progress over time

## 🛠️ Technology Stack

- **Frontend/Backend**: Next.js (App Router)
- **Database**: Firestore (NoSQL)
- **Video Conferencing**: LiveKit API
- **Storage**: AWS S3 buckets for secure session recordings
- **Authentication**: Firebase Authentication
- **Transcription**: OpenAI Whisper API
- **Analysis/Summarization**: OpenAI GPT-4
- **Email Notifications**: SendGrid
- **Styling**: Tailwind CSS with Shadcn/UI components

## 🏗️ Architecture

TherapAI follows a modern fullstack architecture:

1. **User Authentication**: Secure login with role-based access control (patient/therapist)
2. **Video Sessions**: Real-time video conferencing with recording capabilities
3. **Processing Pipeline**:
   - Video recording stored in AWS S3
   - Audio extracted and sent to Whisper API for transcription
   - Transcript processed by GPT-4 for summary generation
   - Results stored in Firestore database
4. **Data Access**: Secure, role-appropriate access to sessions, summaries, and communications

## 📋 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/therapai.git
cd therapai

# Install dependencies
npm install

# Set up environment variables (see .env.example)
cp .env.example .env.local

# Run the development server
npm run dev
```

## ⚙️ Environment Variables

Create a `.env.local` file with the following variables:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_BUCKET_NAME=

# OpenAI
OPENAI_API_KEY=

# SendGrid
SENDGRID_API_KEY=
```

## 🚀 Deployment

TherapAI can be deployed to Vercel or any other platform that supports Next.js applications:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## 💡 Future Enhancements

- **Enhanced Analytics**: More robust data analytics for tracking progress over time
- **Advanced AI Capabilities**: Deeper sentiment analysis and personalized follow-up recommendations
- **Therapist Customization**: Allow therapists to customize summarization parameters
- **Mobile Application**: Dedicated mobile apps for iOS and Android
- **Integration with Health Records**: Secure integration with electronic health record systems
- **Group Therapy Support**: Extensions for managing and analyzing group therapy sessions

## 🔒 Security & Compliance

TherapAI prioritizes the security and privacy of sensitive healthcare data:

- End-to-end encryption for all communications
- HIPAA-compliant data storage and processing
- Strict access controls based on user roles
- Regular security audits and updates
- Transparent data usage policies

## 👥 Contributing

We welcome contributions to TherapAI! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## 📄 License

TherapAI is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- This project was created during TherapyAI by Pavel Stepanov, Hunter Todd, Tim Shaw
- Special thanks to University of Miami for their guidance and support
