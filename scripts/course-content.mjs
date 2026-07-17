const vid = [
  "oXlwWbU8l2o",
  "bMknfKXIFA8",
  "OcycT1Jwsns",
  "i_LwzRVP7bg",
  "gSSsZReIFRk",
  "U_P23SqJaDc",
  "3Kq1MIfTWCE",
  "rfscVS0vtbw",
  "Ke90Tje7VS0",
  "SccSCuHhOw0",
];

let cursor = 0;
const nextVideo = () => vid[cursor++ % vid.length];

const q = (prompt, correct, ...rest) => ({
  prompt,
  options: [correct, ...rest],
  correct_index: 0,
});

export const courses = [
  {
    tutorKey: "cv",
    title: "Computer Vision",
    summary:
      "Teach machines to see. Build image classifiers, object detectors and segmentation models with modern deep learning, then ship them to production.",
    modules: [
      {
        title: "How Machines Represent Images",
        lessons: [
          {
            title: "Pixels, channels and colour spaces",
            youtube_id: nextVideo(),
            body: "Every image a model sees is a grid of numbers. A colour photo is three stacked grids, one each for red, green and blue, with values from 0 to 255. Before a network can learn, we normalise these values, resize images to a fixed shape, and sometimes convert between colour spaces such as RGB, grayscale or HSV. Understanding this raw representation is the foundation for everything that follows: augmentation, convolution and feature extraction all operate on these number grids.",
          },
        ],
        quiz: {
          title: "Image Representation",
          questions: [
            q("A colour image is typically represented as how many channels?", "Three (red, green, blue)", "One", "Five", "Ten"),
            q("What is the usual pixel value range for an 8-bit image?", "0 to 255", "0 to 1 only", "-128 to 128", "0 to 1000"),
            q("Why do we normalise pixel values before training?", "To keep inputs on a consistent scale for stable learning", "To make images larger", "To add colour", "To encrypt the data"),
            q("Converting an image to grayscale reduces it to how many channels?", "One", "Three", "Four", "Two"),
            q("Resizing every image to a fixed shape is needed because", "Networks expect a consistent input size", "Colour requires it", "It compresses files", "It labels the data"),
            q("Which colour space separates brightness from colour?", "HSV", "RGB", "CMYK only", "ASCII"),
            q("A pixel is best described as", "A single sampled point of an image with intensity values", "A neural layer", "A loss function", "A file format"),
            q("Higher image resolution generally means", "More pixels and more detail to process", "Fewer channels", "Less memory used", "No effect on models"),
          ],
        },
        assignment: {
          title: "Explore an image as data",
          instructions: "Load any image in code, print its shape and pixel value range, then convert it to grayscale. Submit a link to your notebook or repository.",
        },
      },
      {
        title: "Convolutions and Feature Maps",
        lessons: [
          {
            title: "Why convolutional layers work",
            youtube_id: nextVideo(),
            body: "A convolutional layer slides a small filter across the image, multiplying and summing pixel values to detect local patterns such as edges, corners and textures. Stacking many of these layers lets the network build up from simple edges to complex shapes and eventually whole objects. Because the same filter is reused across the whole image, convolutions are efficient and naturally handle objects appearing anywhere in the frame.",
          },
        ],
      },
      {
        title: "Building an Image Classifier",
        lessons: [
          {
            title: "From dataset to trained model",
            youtube_id: nextVideo(),
            body: "Classification is the task of assigning a label to an image. You split your data into training, validation and test sets, feed batches through the network, compare predictions to the true labels with a loss function, and update the weights with backpropagation. Watching training and validation accuracy together tells you whether the model is genuinely learning or simply memorising the training set.",
          },
        ],
      },
      {
        title: "Data Augmentation and Regularisation",
        lessons: [
          {
            title: "Making models generalise",
            youtube_id: nextVideo(),
            body: "Real datasets are never big enough. Augmentation multiplies your data by randomly flipping, rotating, cropping and adjusting the brightness of images so the model sees more variety and overfits less. Combined with techniques like dropout and weight decay, augmentation is often the single cheapest way to improve how well a vision model performs on images it has never seen.",
          },
        ],
        quiz: {
          title: "Generalisation",
          questions: [
            q("Data augmentation helps mainly by", "Increasing training variety to reduce overfitting", "Shrinking the model", "Encrypting images", "Speeding up the GPU"),
            q("Overfitting means the model", "Performs well on training data but poorly on new data", "Is too small", "Has no layers", "Cannot load images"),
            q("Dropout works by", "Randomly disabling neurons during training", "Deleting images", "Adding colour", "Removing the loss function"),
            q("A validation set is used to", "Tune and monitor the model without touching the test set", "Train the final weights", "Store passwords", "Label data"),
            q("Which is an augmentation technique?", "Random horizontal flip", "Gradient descent", "Softmax", "Backpropagation"),
            q("Weight decay is a form of", "Regularisation", "Data loading", "Image resizing", "Colour conversion"),
            q("If training accuracy is high but validation accuracy is low, you likely have", "Overfitting", "Underfitting", "A hardware fault", "Too little colour"),
            q("The test set should be used", "Only once, at the very end, to estimate real performance", "Every epoch to train", "To augment images", "To pick the learning rate"),
          ],
        },
      },
      {
        title: "Object Detection in Practice",
        lessons: [
          {
            title: "Bounding boxes and detectors",
            youtube_id: nextVideo(),
            body: "Detection goes beyond classification by finding where objects are, drawing a bounding box around each one and labelling it. Modern detectors predict many candidate boxes and their confidence scores, then remove overlapping duplicates. The quality of a detection is measured by Intersection over Union, which compares the predicted box to the true box.",
          },
        ],
      },
      {
        title: "Image Segmentation",
        lessons: [
          {
            title: "Labelling every pixel",
            youtube_id: nextVideo(),
            body: "Segmentation is the most detailed vision task: instead of a box, it assigns a class to every single pixel, producing a precise mask of each object. Architectures like U-Net use an encoder to compress the image and a decoder to rebuild a full-resolution mask, with skip connections that preserve fine detail. Segmentation powers medical imaging, self-driving perception and photo editing tools.",
          },
        ],
      },
      {
        title: "Shipping Vision Models",
        lessons: [
          {
            title: "From notebook to live endpoint",
            youtube_id: nextVideo(),
            body: "A model only creates value once people can use it. Deployment means exporting the trained weights, wrapping them in an API that accepts an image and returns a prediction, and optimising for speed so responses feel instant. You also monitor the live model for drift, because the real world slowly stops looking like your training data and accuracy quietly degrades if no one is watching.",
          },
        ],
        assignment: {
          title: "Deploy a simple classifier",
          instructions: "Wrap any trained image classifier behind an endpoint that returns a prediction for an uploaded image. Submit the live URL or a short demo video.",
        },
      },
    ],
  },
  {
    tutorKey: "cyber",
    title: "Backend Security",
    summary:
      "Secure the systems behind the product. Threat modelling, authentication, API and data protection, and secure engineering practices for backend developers.",
    modules: [
      {
        title: "Security Foundations",
        lessons: [
          {
            title: "The CIA triad and thinking like an attacker",
            youtube_id: nextVideo(),
            body: "Every security decision comes back to three goals: confidentiality (only the right people can read data), integrity (data cannot be tampered with unnoticed) and availability (the system stays up for legitimate users). Good engineers learn to think like attackers, asking how each feature could be abused. Threat modelling is the disciplined version of that habit: list your assets, imagine the threats against them, and design mitigations before writing code.",
          },
        ],
        quiz: {
          title: "Security Essentials",
          questions: [
            q("What does the C in the CIA triad stand for?", "Confidentiality", "Control", "Compliance", "Continuity"),
            q("Integrity means", "Data cannot be altered without detection", "Data is always available", "Data is encrypted at rest only", "Data is public"),
            q("Threat modelling is best done", "Early, before and during design", "Only after a breach", "Never for small apps", "Once a year by lawyers"),
            q("Which attack makes a service unavailable?", "Denial of Service", "Phishing", "SQL injection", "Cross-site scripting"),
            q("The principle of least privilege means", "Give each user and service only the access they need", "Give admins all access", "Disable logging", "Share one password"),
            q("Defence in depth means", "Multiple independent layers of protection", "A single strong firewall", "Encrypting nothing", "Trusting the network"),
            q("An asset in threat modelling is", "Something valuable worth protecting", "A type of firewall", "A password", "A server rack"),
            q("Thinking like an attacker helps you", "Anticipate how features can be abused", "Write faster code", "Avoid testing", "Remove authentication"),
          ],
        },
      },
      {
        title: "Authentication and Sessions",
        lessons: [
          {
            title: "Proving who a user is",
            youtube_id: nextVideo(),
            body: "Authentication answers the question: who is this request from? Passwords must never be stored in plain text; they are hashed with a slow algorithm like bcrypt or argon2 and a unique salt. Sessions or signed tokens then carry the user's identity across requests. Adding a second factor, such as a one-time code, dramatically reduces the damage a stolen password can do.",
          },
        ],
      },
      {
        title: "Authorisation and Access Control",
        lessons: [
          {
            title: "Deciding what a user may do",
            youtube_id: nextVideo(),
            body: "Authentication proves identity; authorisation decides permissions. Role-based access control groups permissions into roles like student, tutor and admin, while row-level security enforces rules right at the database so a user can only ever touch their own data. The golden rule is to check authorisation on the server for every sensitive action, never trusting anything the browser sends.",
          },
        ],
        assignment: {
          title: "Design an access-control model",
          instructions: "For a small app of your choice, define the roles, the resources, and exactly which role can read or write each resource. Submit a short document or diagram.",
        },
      },
      {
        title: "Common Web Vulnerabilities",
        lessons: [
          {
            title: "Injection, XSS and the OWASP Top 10",
            youtube_id: nextVideo(),
            body: "Most breaches exploit a short list of well-known flaws. SQL injection happens when user input is glued directly into a query; the fix is parameterised queries. Cross-site scripting injects malicious scripts into pages; the fix is escaping output and a content security policy. The OWASP Top 10 catalogues these recurring risks, and knowing them turns vague worry into a concrete checklist.",
          },
        ],
        quiz: {
          title: "Web Vulnerabilities",
          questions: [
            q("SQL injection is prevented mainly by", "Parameterised queries", "Longer passwords", "More servers", "Disabling HTTPS"),
            q("Cross-site scripting (XSS) targets", "Users, by injecting scripts into pages", "Databases directly", "CPU registers", "DNS records"),
            q("The OWASP Top 10 is", "A list of the most common web security risks", "A firewall brand", "A password manager", "A cloud provider"),
            q("Escaping output helps prevent", "XSS", "Denial of Service", "Slow queries", "Data loss"),
            q("A content security policy restricts", "Which scripts and resources a page can load", "How fast pages load", "Database size", "User roles"),
            q("Never trust", "Input coming from the client", "Your own database schema", "Parameterised queries", "Hashed passwords"),
            q("Sensitive data in transit should be", "Encrypted with TLS/HTTPS", "Sent as plain text", "Compressed only", "Stored in the URL"),
            q("A zero-day is", "A vulnerability with no available patch yet", "A daily backup", "A password reset", "A load balancer"),
          ],
        },
      },
      {
        title: "Protecting Data",
        lessons: [
          {
            title: "Encryption, hashing and secrets",
            youtube_id: nextVideo(),
            body: "Encryption keeps data unreadable to anyone without the key, both in transit over TLS and at rest in the database. Hashing is one-way and is the correct tool for passwords, never reversible encryption. Secrets such as API keys and database passwords belong in a secrets manager or environment variables, never committed to source control where a single leak can compromise everything.",
          },
        ],
      },
      {
        title: "Securing APIs",
        lessons: [
          {
            title: "Rate limiting, validation and CORS",
            youtube_id: nextVideo(),
            body: "APIs are the front door of a backend and attract automated abuse. Validate and sanitise every incoming payload, enforce authentication and authorisation on each endpoint, and rate-limit requests to blunt brute-force and denial-of-service attempts. Careful CORS configuration controls which web origins may call your API, closing a common hole that developers leave wide open during development.",
          },
        ],
      },
      {
        title: "Monitoring and Incident Response",
        lessons: [
          {
            title: "Detecting and responding to attacks",
            youtube_id: nextVideo(),
            body: "You cannot defend what you cannot see. Structured logging, alerting on suspicious patterns and regular review of access logs let you catch an attack while it is happening rather than months later. A written incident-response plan, deciding in advance who does what when something goes wrong, is the difference between a controlled recovery and a chaotic scramble.",
          },
        ],
        assignment: {
          title: "Write a mini incident-response plan",
          instructions: "Draft a one-page plan describing how your team would detect, contain and recover from a suspected data breach. Submit the document as a link or file.",
        },
      },
    ],
  },
  {
    tutorKey: "backend",
    title: "Backend Development",
    summary:
      "Build the engine behind every product. APIs, databases, authentication, testing and deployment, from first endpoint to production-ready service.",
    modules: [
      {
        title: "How the Web Works",
        lessons: [
          {
            title: "Requests, responses and HTTP",
            youtube_id: nextVideo(),
            body: "Every backend lives inside a simple loop: a client sends an HTTP request, your server does some work, and it sends back a response. Requests carry a method (GET, POST, PUT, DELETE), a path, headers and sometimes a body; responses carry a status code and data. Understanding this request-response cycle, and what status codes like 200, 404 and 500 mean, is the mental model everything else builds on.",
          },
        ],
        quiz: {
          title: "Web Fundamentals",
          questions: [
            q("Which HTTP method is typically used to create a resource?", "POST", "GET", "HEAD", "OPTIONS"),
            q("A 404 status code means", "Not found", "Success", "Server error", "Unauthorised"),
            q("A 500 status code means", "A server-side error occurred", "The request succeeded", "The page moved", "Access denied"),
            q("GET requests should be", "Safe and not change server state", "Used to delete data", "Always authenticated", "Sent without a path"),
            q("HTTP headers carry", "Metadata about the request or response", "Only images", "The database schema", "CPU instructions"),
            q("The request-response cycle describes", "A client asking and a server answering", "Two databases syncing", "A CSS animation", "A git commit"),
            q("A 200 status code means", "Success", "Redirect", "Client error", "Server error"),
            q("An API endpoint is", "A URL the server responds to with data or an action", "A database table", "A CSS class", "A container"),
          ],
        },
      },
      {
        title: "Designing REST APIs",
        lessons: [
          {
            title: "Resources, verbs and status codes",
            youtube_id: nextVideo(),
            body: "A REST API models your system as resources, such as users or courses, that clients act on with standard HTTP verbs. Good design uses clear, plural, noun-based paths, returns the right status codes, and keeps responses predictable. Consistency is what makes an API pleasant: once a developer learns one endpoint, they can guess how the rest behave.",
          },
        ],
        assignment: {
          title: "Design a small REST API",
          instructions: "Design the endpoints for a simple app (for example a to-do list): list the paths, methods and what each returns. Submit the design as a document or a working repository.",
        },
      },
      {
        title: "Databases and Data Modelling",
        lessons: [
          {
            title: "Tables, relationships and queries",
            youtube_id: nextVideo(),
            body: "Data is the heart of most backends, and a relational database stores it in tables with rows and columns. Relationships connect tables, for example a course having many lessons, expressed with foreign keys. Learning to model data cleanly and write queries that select, join and aggregate is a skill you will use in almost every project you ever build.",
          },
        ],
      },
      {
        title: "Authentication and Users",
        lessons: [
          {
            title: "Signup, login and protected routes",
            youtube_id: nextVideo(),
            body: "Almost every real app needs accounts. You store users securely with hashed passwords, issue a session or token on login, and check it on every protected route. Getting this right early matters, because authentication touches security, user experience and data privacy all at once, and it is painful to bolt on later.",
          },
        ],
        quiz: {
          title: "Backend Auth",
          questions: [
            q("Passwords should be stored as", "Salted hashes", "Plain text", "Base64", "In the URL"),
            q("A protected route should", "Verify the user's identity before responding", "Skip all checks", "Return everyone's data", "Only work on GET"),
            q("A foreign key expresses", "A relationship between two tables", "A password", "A CSS rule", "An HTTP header"),
            q("Which statement retrieves data in SQL?", "SELECT", "DELETE", "DROP", "COMMIT"),
            q("A session or token is used to", "Carry the user's identity across requests", "Style the page", "Compress images", "Cache CSS"),
            q("Hashing differs from encryption because it is", "One-way and not meant to be reversed", "Always reversible", "Only for images", "Faster than everything"),
            q("Validating input on the server is", "Essential, because clients can be bypassed", "Optional if the UI validates", "Only for images", "A frontend concern"),
            q("An ORM helps you", "Work with the database using code objects", "Design logos", "Deploy servers", "Write CSS"),
          ],
        },
      },
      {
        title: "Testing and Reliability",
        lessons: [
          {
            title: "Unit, integration and confidence",
            youtube_id: nextVideo(),
            body: "Tests are how you change code without fear. Unit tests check a single function, integration tests check that parts work together, and end-to-end tests check a whole flow like signing up. A backend with good tests can be refactored and extended safely, which is exactly what production systems need over their long lives.",
          },
        ],
      },
      {
        title: "Performance and Caching",
        lessons: [
          {
            title: "Making backends fast",
            youtube_id: nextVideo(),
            body: "As traffic grows, slow endpoints become real problems. The usual culprits are unindexed database queries and repeated work that could be cached. Adding the right indexes, caching expensive results, and paginating large lists often turns a sluggish API into a fast one without rewriting the whole thing. Always measure first: optimise the bottleneck, not a guess.",
          },
        ],
      },
      {
        title: "Deployment and Operations",
        lessons: [
          {
            title: "Shipping and running in production",
            youtube_id: nextVideo(),
            body: "Writing code is half the job; running it reliably is the other half. Deployment means packaging your app, setting environment variables and secrets, and putting it behind a platform that can restart and scale it. Logging, monitoring and a rollback plan turn a scary deploy into a routine one, so you can ship improvements to users every day with confidence.",
          },
        ],
        assignment: {
          title: "Deploy a backend service",
          instructions: "Deploy any small API to a hosting platform with environment variables configured. Submit the live base URL and one example endpoint.",
        },
      },
    ],
  },
  {
    tutorKey: "data",
    title: "Data Intelligence",
    summary:
      "Turn raw data into decisions. Analysis, visualisation, statistics and the fundamentals of machine learning, from messy spreadsheets to predictive models.",
    modules: [
      {
        title: "Thinking with Data",
        lessons: [
          {
            title: "Questions, evidence and decisions",
            youtube_id: nextVideo(),
            body: "Data intelligence starts not with tools but with a good question. Before touching a spreadsheet you decide what decision the data should inform and what evidence would actually answer it. This habit keeps analysis honest and prevents the common trap of producing impressive charts that answer nothing anyone asked.",
          },
        ],
        quiz: {
          title: "Data Thinking",
          questions: [
            q("A good analysis starts with", "A clear question or decision to inform", "The fanciest chart", "A large model", "A new database"),
            q("The mean is", "The arithmetic average of the values", "The middle value", "The most frequent value", "The largest value"),
            q("The median is", "The middle value when data is sorted", "The average", "The range", "The mode"),
            q("An outlier is", "A value far from the rest of the data", "A missing value", "A column header", "A chart type"),
            q("Correlation does not imply", "Causation", "A number between -1 and 1", "A relationship", "A pattern"),
            q("Clean data means", "Data that is consistent, complete and correctly typed", "Data with more rows", "Data in colour", "Encrypted data"),
            q("A histogram shows", "The distribution of a single variable", "A relationship between two variables over time", "A map", "A password"),
            q("The first step before modelling is usually", "Exploring and cleaning the data", "Deploying to production", "Buying a GPU", "Writing tests"),
          ],
        },
      },
      {
        title: "Cleaning and Preparing Data",
        lessons: [
          {
            title: "Handling missing and messy values",
            youtube_id: nextVideo(),
            body: "Real data is messy: missing values, inconsistent formats, duplicates and typos are the norm. Most of an analyst's time goes into cleaning, deciding whether to drop, fill or flag missing values, standardising formats and removing duplicates. This unglamorous work is what makes every later chart and model trustworthy.",
          },
        ],
        assignment: {
          title: "Clean a messy dataset",
          instructions: "Take any public dataset, document at least three data-quality issues you find, and clean them. Submit your notebook with before-and-after notes.",
        },
      },
      {
        title: "Exploratory Analysis",
        lessons: [
          {
            title: "Summaries, groups and patterns",
            youtube_id: nextVideo(),
            body: "Exploratory analysis is where you get to know your data. You compute summaries like means and counts, group by categories to compare segments, and look for patterns and surprises. The goal is understanding, not final answers, and the questions this stage raises usually shape the rest of the project.",
          },
        ],
      },
      {
        title: "Data Visualisation",
        lessons: [
          {
            title: "Charts that tell the truth",
            youtube_id: nextVideo(),
            body: "A good chart makes a pattern obvious in seconds; a bad one misleads. You learn to match the chart to the question, a line for trends over time, a bar for comparisons, a histogram for distributions, and to keep it honest with clear axes and no distorted scales. Visualisation is how analysis becomes persuasion for a decision-maker.",
          },
        ],
        quiz: {
          title: "Visualisation and Stats",
          questions: [
            q("A line chart is best for", "Trends over time", "Comparing a few categories", "Showing a distribution", "A single number"),
            q("A bar chart is best for", "Comparing categories", "Continuous time trends", "Pixel data", "Passwords"),
            q("The standard deviation measures", "How spread out the values are", "The average", "The count", "The maximum"),
            q("A misleading chart often has", "A distorted or truncated axis", "Clear labels", "Honest scales", "A legend"),
            q("Sampling means", "Using a representative subset of the data", "Deleting all data", "Encrypting rows", "Adding columns"),
            q("A p-value helps you judge", "Whether a result is likely due to chance", "The colour of a chart", "The file size", "The database schema"),
            q("Aggregation includes operations like", "Sum, count and average by group", "Encrypt and hash", "Flip and rotate", "Compile and deploy"),
            q("The best chart is the one that", "Answers the question most clearly", "Uses the most colours", "Is the most complex", "Has 3D effects"),
          ],
        },
      },
      {
        title: "Statistics Foundations",
        lessons: [
          {
            title: "Distributions, variation and inference",
            youtube_id: nextVideo(),
            body: "Statistics gives you the language to reason about uncertainty. You learn how data is distributed, how much it naturally varies, and how to tell a real effect from random noise. These ideas stop you from over-reacting to a lucky week or dismissing a genuine trend, which is exactly the judgement good data work requires.",
          },
        ],
      },
      {
        title: "Introduction to Machine Learning",
        lessons: [
          {
            title: "Learning patterns from data",
            youtube_id: nextVideo(),
            body: "Machine learning lets a model learn patterns from examples instead of being explicitly programmed. In supervised learning you show the model labelled examples and it learns to predict the label for new data. You split data into training and test sets, fit a simple model, and measure its accuracy, the same workflow that scales up to the most advanced systems.",
          },
        ],
      },
      {
        title: "Communicating Insights",
        lessons: [
          {
            title: "From analysis to action",
            youtube_id: nextVideo(),
            body: "An insight that no one acts on is wasted. The final skill of data intelligence is telling a clear story: state the question, show the key evidence simply, and make a concrete recommendation. Tailoring that story to your audience, an executive wants the decision, an engineer wants the detail, is what turns analysis into real-world impact.",
          },
        ],
        assignment: {
          title: "Present a data story",
          instructions: "Analyse a dataset of your choice and produce a short report or slide deck with one clear question, the key evidence, and a recommendation. Submit it as a link or file.",
        },
      },
    ],
  },
  {
    tutorKey: "foundations",
    title: "AVZDAX Foundations Programme",
    summary:
      "A practical, instructor-led pathway that builds the thinking, coding and problem-solving foundations to launch a career in technology.",
    modules: [
      {
        title: "Critical and Systems Thinking",
        lessons: [
          {
            title: "Seeing problems as systems",
            youtube_id: nextVideo(),
            body: "Technology work is really problem-solving in disguise. Systems thinking teaches you to see a problem as connected parts, inputs, processes, feedback and outputs, rather than isolated events. Breaking a large, vague problem into smaller, well-defined pieces is the single most useful habit you can build, and it applies whether you end up in code, data or security.",
          },
        ],
        quiz: {
          title: "Thinking Foundations",
          questions: [
            q("Systems thinking means seeing", "Connected parts, feedback and outcomes", "Only the final result", "Isolated events", "Just the user interface"),
            q("Decomposition is", "Breaking a big problem into smaller solvable parts", "Deleting a problem", "Ignoring edge cases", "Writing more code"),
            q("A good problem statement is", "Specific and clearly defined", "Vague and broad", "Always technical", "About tools first"),
            q("Debugging is mostly about", "Forming and testing hypotheses about causes", "Guessing randomly", "Rewriting everything", "Avoiding the error"),
            q("Feedback in a system is", "Output that loops back to influence future behaviour", "A user complaint only", "A type of variable", "A colour"),
            q("First principles thinking means", "Reasoning up from what you know is true", "Copying an existing answer", "Skipping the basics", "Memorising syntax"),
            q("A helpful first step on a hard problem is", "Restating it clearly in your own words", "Writing code immediately", "Asking for the answer", "Giving up"),
            q("Trade-offs mean", "Every choice gains something and costs something", "There is always one perfect option", "Cost never matters", "Speed is always best"),
          ],
        },
      },
      {
        title: "Programming Fundamentals",
        lessons: [
          {
            title: "Variables, logic and functions",
            youtube_id: nextVideo(),
            body: "All programming rests on a few ideas: storing values in variables, making decisions with conditionals, repeating work with loops, and packaging logic into reusable functions. Once these click in one language they transfer to every other. The goal at this stage is not memorising syntax but learning to express a step-by-step solution the computer can follow.",
          },
        ],
        assignment: {
          title: "Write your first small program",
          instructions: "Write a short program that solves a simple real problem (for example a tip calculator or a word counter). Submit a link to your code.",
        },
      },
      {
        title: "Data and AI Fundamentals",
        lessons: [
          {
            title: "What data and AI really are",
            youtube_id: nextVideo(),
            body: "Data is simply recorded facts, and modern AI is largely about finding patterns in enough of it. You do not need advanced maths to start: understanding what a dataset is, how a model learns from examples, and where AI is strong or weak gives you the literacy to use these tools responsibly and to know when they are the wrong choice.",
          },
        ],
      },
      {
        title: "Cybersecurity Foundations",
        lessons: [
          {
            title: "Staying safe and thinking defensively",
            youtube_id: nextVideo(),
            body: "Security is everyone's job. At the foundations level you learn the mindset, protecting confidentiality, integrity and availability, and the everyday habits that stop most attacks: strong unique passwords, multi-factor authentication, recognising phishing and never trusting input blindly. Thinking defensively early makes you a safer engineer in whatever field you choose.",
          },
        ],
        quiz: {
          title: "Foundations Check",
          questions: [
            q("A variable is", "A named place to store a value", "A type of loop", "A web page", "A password"),
            q("A conditional statement lets a program", "Make decisions based on a condition", "Repeat forever", "Store images", "Encrypt data"),
            q("A function is", "Reusable packaged logic", "A database table", "A colour", "A server"),
            q("Multi-factor authentication adds", "A second proof of identity beyond a password", "A faster login", "More storage", "A new colour"),
            q("Phishing tries to", "Trick people into revealing secrets", "Speed up the network", "Compress files", "Index a database"),
            q("A dataset is", "A collection of recorded facts or examples", "A programming language", "A firewall", "A chart"),
            q("A loop is used to", "Repeat a block of work", "Store one value", "Style a page", "Delete a file"),
            q("A strong password is", "Long, unique and hard to guess", "Short but reused", "Your name", "The word password"),
          ],
        },
      },
      {
        title: "Technical Problem-Solving",
        lessons: [
          {
            title: "A method for hard problems",
            youtube_id: nextVideo(),
            body: "When you are stuck, a method beats panic. Understand the problem, restate it, break it into steps, solve the smallest piece, then build up while testing as you go. Reading error messages carefully and searching effectively are real skills. This repeatable loop is what separates engineers who make steady progress from those who thrash.",
          },
        ],
      },
      {
        title: "Version Control and Collaboration",
        lessons: [
          {
            title: "Working with Git and a team",
            youtube_id: nextVideo(),
            body: "Real software is built by teams, and Git is how they work together without overwriting each other. You learn to save snapshots with commits, branch to work on a feature in isolation, and merge changes back. Beyond the commands, you learn the collaboration habits, small commits, clear messages and reviewing each other's work, that make a team effective.",
          },
        ],
      },
      {
        title: "Building Real-World Projects",
        lessons: [
          {
            title: "From idea to finished project",
            youtube_id: nextVideo(),
            body: "Everything comes together in a project. You take an idea, scope it down to something you can actually finish, build it in small tested steps, and share it. A finished, working project, however small, teaches more than a dozen tutorials and becomes the portfolio piece that proves to an employer you can turn knowledge into something real.",
          },
        ],
        assignment: {
          title: "Ship a capstone project",
          instructions: "Plan and build a small end-to-end project that uses what you learned in this programme. Submit a link to the live project or its repository with a short description.",
        },
      },
    ],
  },
];
