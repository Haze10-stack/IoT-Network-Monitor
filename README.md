# 📡 IoT-Based Distributed Network Monitoring System

A **distributed network observability platform** that uses ESP32-based packet sniffers and a cloud-native backend to monitor Wi-Fi network behavior in real-time, with advanced anomaly detection, IDS capabilities, and complete DevOps orchestration.

---

## 🧠 Overview

Unlike traditional tools such as Wireshark, this system focuses on **metadata analysis (MAC, RSSI, timing)** instead of payload inspection, ensuring privacy while enabling comprehensive network security monitoring. The system combines edge computing with cloud-native streaming architecture to detect network anomalies, rogue access points, and suspicious devices in real-time.

**Key Innovation**: Multi-layer protocol analysis from Layer 1 (802.11 physical frames) through Layer 7 (application-level APIs) with distributed processing across Kubernetes clusters.

---

## 👥 Team Component Breakdown

### **Paras - Layer 1-2: Physical & Data Link Layer**
- **802.11 MAC Frame Capture & Analysis**
  - Decoding MAC frame headers (Frame Control, Duration/ID, Sequence numbers)
  - Extracting Management frames (Beacon, Probe Request/Response, Authentication)
  - Data frame analysis for traffic patterns
- **OUI (Organizationally Unique Identifier) Lookup**
  - Device vendor identification from MAC addresses
  - OUI database maintenance and updates
  - Rogue device detection through OUI anomalies
- **ESP32 Promiscuous Mode Implementation**
  - Raw packet capture and frame buffering
  - Timestamp synchronization and RSSI collection

### **Smrutikant - Layer 4-7: Transport & Application Layer**
- **HTTP/TCP Protocol Handling**
  - RESTful API design for data endpoints
  - TCP connection state tracking and anomaly detection
  - Payload analysis for Layer 7 anomalies
- **Kafka Pub-Sub Architecture**
  - Event-driven streaming pipeline with topic partitioning
  - Consumer group management for distributed processing
  - High-throughput packet metadata streaming
  - Offset management and fault tolerance
- **Distributed Data Processing**
  - Real-time aggregation and transformation
  - Stateful stream processing for anomaly detection
  - Windowing operations for temporal analysis

### **Kushal - Security & Anomaly Detection**
- **Intrusion Detection System (IDS)**
  - MAC spoofing pattern recognition
  - Unauthorized access point detection
  - Traffic anomaly flagging
- **Rogue AP Detection**
  - Beacon frame spoofing identification
  - Unauthorized SSID broadcasting detection
  - Evil twin access point identification
- **RSSI Analysis**
  - Signal strength profiling for device locations
  - Unexpected signal strength patterns
  - Device location tracking and anomalies
- **Traffic Anomaly Detection**
  - Spike detection algorithms
  - Unusual device behavior identification
  - Protocol violation detection

### **Omar - API & Data Exchange**
- **REST API Design & Implementation**
  - Client-server communication architecture
  - Standardized endpoint design for device queries, alerts, and analytics
  - Stateless API design for horizontal scaling
- **JSON over HTTP**
  - Data serialization format for ingestion and retrieval
  - Schema validation and versioning
  - Error response standardization
- **Backend Data Access Layer**
  - Query optimization for large-scale device databases
  - Pagination and filtering mechanisms
  - Real-time data aggregation endpoints

### **Omkar - Container Orchestration & Observability**
- **Container Networking**
  - Multi-container service communication via Docker Compose
  - Service discovery and inter-pod networking in Kubernetes
  - Network policies for security isolation
- **Kubernetes Ingress Configuration**
  - External traffic routing to frontend and backend services
  - Load balancing across service replicas
  - TLS termination for secure communication
  - Host-based routing for multi-service architecture
- **Observability & Monitoring**
  - Prometheus metrics collection from all services
  - Grafana dashboard setup for real-time visualization
  - Log aggregation and distributed tracing
  - Health checks and service readiness probes
  - Performance metrics and alerting

---

## 🎯 Goals

* Provide **real-time visibility** into Wi-Fi networks from Layer 1 to Layer 7
* Enable **distributed packet monitoring using IoT devices** at the edge
* Build a **scalable backend using streaming architecture** with Kafka
* Detect security anomalies and threats:
  * Rogue access points and unauthorized devices
  * MAC spoofing and device impersonation
  * Traffic spikes and unusual behavior patterns
  * Signal strength anomalies and location tracking inconsistencies
* Demonstrate **enterprise DevOps practices** using containerization, orchestration, and observability
* Provide **forensic-grade packet metadata** for security analysis

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ EDGE LAYER (Layer 1-2)                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │ ESP32 Sniffer 1  │  │ ESP32 Sniffer 2  │  │ ESP32 Sniffer N  │
│  │ (802.11 Frames)  │  │ (MAC + RSSI)     │  │ (OUI Lookup)     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
│           │                     │                     │
└───────────┼─────────────────────┼─────────────────────┼───────────┘
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  HTTP/JSON Ingestion API   │ (Layer 7)
                    │  (Node.js Express)         │
                    │  ├─ POST /packets          │
                    │  ├─ Validation             │
                    │  └─ Rate Limiting          │
                    └─────────────┬──────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│ STREAMING LAYER (Layer 4)                                          │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           Apache Kafka (Pub-Sub Architecture)               │  │
│  │ ┌──────────────────────────────────────────────────────┐    │  │
│  │ │ packet-metadata → [Partition 0, 1, 2, 3...]        │    │  │
│  │ │ alerts → [Alert Partition]                          │    │  │
│  │ │ devices → [Device State Partition]                  │    │  │
│  │ └──────────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│ PROCESSING LAYER (Anomaly Detection & IDS)                         │
├───────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │        Processing Service (Kafka Consumer)                  │ │
│  │  ├─ RSSI Analysis (Location & Signal Tracking)              │ │
│  │  ├─ Rogue AP Detection (Beacon Analysis)                    │ │
│  │  ├─ MAC Spoofing Detection (Behavior Profiling)             │ │
│  │  ├─ Traffic Anomaly Detection (Spike Detection)             │ │
│  │  └─ IDS Ruleset Application                                 │ │
│  └───────────────┬────────────────────────────────────────────┘ │
└────────────────┼───────────────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │    MongoDB      │ (Storage Layer)
        │  ├─ Devices     │
        │  ├─ Packets     │
        │  ├─ Alerts      │
        │  └─ Analytics   │
        └────────┬────────┘
                 │
┌────────────────▼───────────────────────────────────────────────────┐
│ API & SERVICES LAYER (REST API)                                    │
├───────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │        Backend API (Node.js Express)                        │ │
│  │  GET /devices      - All monitored devices                  │ │
│  │  GET /devices/:id  - Device details & RSSI history          │ │
│  │  GET /alerts       - Security alerts & anomalies            │ │
│  │  GET /stats        - Network statistics                     │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼──────────────────────────────────┐
│ PRESENTATION LAYER                                                 │
├───────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐    ┌──────────────────────────┐ │
│  │  Frontend (React)            │    │ Monitoring Stack         │ │
│  │  ├─ Device Dashboard         │    │ ├─ Prometheus Metrics   │ │
│  │  ├─ RSSI Chart Visualization │    │ ├─ Grafana Dashboards   │ │
│  │  ├─ Alert Management         │    │ └─ Log Aggregation      │ │
│  │  └─ Real-time Stats          │    └──────────────────────────┘ │
│  └──────────────────────────────┘                                  │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow & Protocol Stack

### **1. Packet Capture (Layer 1-2)**
ESP32 devices operate in **promiscuous mode** to capture all Wi-Fi frames:
- **802.11 MAC Frame Structure Analysis**
  - Frame Control byte: Type (Management/Data/Control) and Subtype extraction
  - Sequence number tracking for duplicate detection
  - Address fields: TA (Transmitter), RA (Receiver), SA (Source), DA (Destination)
  - Frame body: Authentication tokens, beacon content, probe responses
- **RSSI & Timestamp Collection**
  - Signal strength profiling per device and location
  - Microsecond-precision timestamps for latency analysis
- **OUI Resolution**
  - MAC address vendor identification
  - Device type inference from manufacturer patterns

### **2. Data Ingestion (Layer 7 - HTTP/JSON)**
ESP32 → Ingestion API via HTTP POST requests:
```json
{
  "mac_address": "aa:bb:cc:dd:ee:ff",
  "rssi": -45,
  "frame_type": "beacon",
  "ssid": "NetworkName",
  "timestamp": 1672531200000,
  "channel": 6,
  "flags": ["encrypted", "hidden_ssid"]
}
```

### **3. Streaming Pipeline (Layer 4 - Kafka Pub-Sub)**
**Producer**: Ingestion API publishes normalized JSON to Kafka topics
- **Topic: `packet-metadata`** - All captured frames
  - Partitioned by MAC address hash for device-level ordering
  - Retention: 24 hours
- **Consumer Groups**: 
  - Processing service consumes for anomaly detection
  - Analytics service for historical analysis
  - Multiple consumer instances for horizontal scaling

### **4. Processing & Anomaly Detection**
**Kafka Consumer** processes frames with stateful operations:

#### **RSSI Analysis**
- Builds signal strength profiles for each device
- Detects sudden signal loss (device disconnection)
- Identifies location anomalies (device in unexpected location)
- Flags impossible jumps in signal strength (spoofing indicator)

#### **Rogue AP Detection**
- Tracks beacon frame patterns per SSID
- Flags multiple devices claiming same SSID with different MACs (Evil Twin)
- Analyzes timing inconsistencies in beacon intervals
- Detects beacon frame spoofing based on vendor OUI

#### **MAC Spoofing Detection**
- Maintains behavioral profiles per MAC address
- Flags impossible state transitions (e.g., device jumping between distant APs instantly)
- Detects MAC address reuse patterns
- Correlates with RSSI and temporal data

#### **Traffic Anomalies**
- Windowed spike detection on packet rates
- Unusual protocol combinations
- Data frame volume anomalies

### **5. Storage (MongoDB)**
Processed data persisted for forensics and analytics:
```
devices: {_id, mac, oui, vendor, first_seen, last_seen, rssi_history}
alerts: {_id, type, severity, mac, timestamp, reason}
packets: {_id, mac, rssi, frame_type, timestamp}
```

### **6. REST API (Layer 7)**
Backend provides standardized HTTP endpoints for frontend:
```
GET /devices             → Array of all tracked devices
GET /devices/:mac/stats  → Device's RSSI, traffic stats
GET /alerts              → Sorted security alerts
GET /alerts/:id          → Alert details with evidence
GET /anomalies           → Current detected anomalies
```
**Protocol**: JSON over HTTP, stateless request/response model

### **7. Frontend Visualization**
React dashboard consumes REST API:
- Real-time device table with vendor info
- RSSI trend charts (location tracking)
- Alert notification system
- Network topology visualization

---

## 🚀 Running the Project

### **Prerequisites**

Ensure you have the following installed:
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Kubernetes** (kubectl v1.24+) - Optional, for K8s deployment
- **Node.js** (v16+) - For local development
- **Python 3.8+** - For OUI database download script

### **Quick Start: Docker Compose (All-in-One)**

This runs all services locally for development and testing:

```bash
# Navigate to project root
cd IoT-Network-Monitor

# Create necessary volumes
mkdir -p data/mongodb data/kafka

# Start all services
docker-compose -f infra/docker-compose.yml up -d

# Verify services are running
docker-compose -f infra/docker-compose.yml ps
```

**Services Started:**
- **Kafka** (localhost:9092)
- **MongoDB** (localhost:27017)
- **Ingestion API** (localhost:3001) - Receives ESP32 packets
- **Backend API** (localhost:3002) - REST endpoints
- **Processing Service** (background) - Anomaly detection
- **Frontend** (localhost:80) - React dashboard
- **Prometheus** (localhost:9090) - Metrics
- **Grafana** (localhost:3000) - Visualization

**Check Service Health:**
```bash
# Ingest API status
curl http://localhost:3001/health

# Backend API status
curl http://localhost:3002/health

# Access Frontend
open http://localhost

# Prometheus metrics
open http://localhost:9090

# Grafana dashboards (default: admin/admin)
open http://localhost:3000
```

### **Kubernetes Deployment**

For production-scale deployment with orchestration, networking, and observability:

#### **1. Create Kubernetes Namespace**
```bash
kubectl apply -f infra/k8s/namespace.yaml
```

#### **2. Deploy MongoDB**
```bash
kubectl apply -f infra/k8s/mongo/deployment.yml
kubectl wait --for=condition=ready pod -l app=mongo -n iot-monitoring --timeout=300s
```

#### **3. Deploy Kafka**
```bash
kubectl apply -f infra/k8s/kafka/deployment.yml
kubectl wait --for=condition=ready pod -l app=kafka -n iot-monitoring --timeout=300s
```

#### **4. Deploy Backend Services**
```bash
# Ingestion API (receives ESP32 data)
kubectl apply -f infra/k8s/ingestion-api/deployment.yml

# Backend API (serves REST endpoints)
kubectl apply -f infra/k8s/backend-api/deployment.yml

# Processing Service (anomaly detection)
kubectl apply -f infra/k8s/processing-service/deployment.yml

# Frontend (React dashboard)
kubectl apply -f infra/k8s/frontend/deployment.yml
```

#### **5. Verify Deployments**
```bash
# Check all pods are running
kubectl get pods -n iot-monitoring

# View pod logs (e.g., ingestion-api)
kubectl logs -n iot-monitoring -l app=ingestion-api --tail=50 -f

# Port forward for local access
kubectl port-forward -n iot-monitoring svc/ingestion-api 3001:3001
kubectl port-forward -n iot-monitoring svc/backend-api 3002:3002
kubectl port-forward -n iot-monitoring svc/frontend 3000:80
```

#### **6. Configure Ingress for External Access**
```bash
# Apply Ingress configuration (update domain/IPs as needed)
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iot-monitor-ingress
  namespace: iot-monitoring
spec:
  rules:
  - host: iot-monitor.local
    http:
      paths:
      - path: /api/ingestion
        pathType: Prefix
        backend:
          service:
            name: ingestion-api
            port:
              number: 3001
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-api
            port:
              number: 3002
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
EOF

# Verify ingress
kubectl get ingress -n iot-monitoring
```

### **ESP32 Setup**

#### **1. Install Arduino IDE & ESP32 Board**
- Download Arduino IDE: https://www.arduino.cc/en/software
- Add ESP32 board: Preferences → Additional Boards Manager URLs
  - Add: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
- Install ESP32 boards from Board Manager

#### **2. Configure ESP32 Sniffer Code**
Edit `esp32/sniffer/sniffer.ino`:
```cpp
// Replace with your network details
const char* SSID = "YourNetworkSSID";
const char* PASSWORD = "YourPassword";
const char* INGESTION_SERVER = "http://192.168.1.100:3001/packets";  // IP of ingestion API

// Capture interval (milliseconds)
const unsigned long CAPTURE_INTERVAL = 5000;

// Promiscuous mode callback will send captured frames to ingestion API via HTTP
```

#### **3. Upload to ESP32**
- Connect ESP32 via USB
- Select board: Tools → Board → ESP32 Dev Module
- Select port: Tools → Port → /dev/ttyUSB0 (or COM port on Windows)
- Click Upload

#### **4. Verify Capture**
```bash
# Check Serial Monitor (9600 baud) for debug output
# Should show: "Capturing frames...", "Sent to ingestion API: <mac>"

# Monitor ingestion API logs
kubectl logs -n iot-monitoring -l app=ingestion-api -f

# Verify data in MongoDB
kubectl exec -it mongo-pod -n iot-monitoring -- mongo

# Inside mongo shell:
> use iot_network
> db.packets.find().limit(5)
```

### **Local Development**

#### **1. Install Dependencies**

```bash
# Frontend
cd frontend
npm install

# Ingestion API
cd ../services/ingestion-api
npm install

# Backend API
cd ../backend-api
npm install

# Processing Service
cd ../processing-service
npm install
```

#### **2. Start Services Locally**

**Terminal 1: Start Kafka & MongoDB (Docker)**
```bash
docker-compose -f infra/docker-compose.yml up kafka mongo
```

**Terminal 2: Ingestion API**
```bash
cd services/ingestion-api
npm start
# Listens on http://localhost:3001
```

**Terminal 3: Backend API**
```bash
cd services/backend-api
npm start
# Listens on http://localhost:3002
```

**Terminal 4: Processing Service**
```bash
cd services/processing-service
npm start
# Subscribes to Kafka topics
```

**Terminal 5: Frontend**
```bash
cd frontend
npm run dev
# Listens on http://localhost:5173
```

### **Download OUI Database (Vendor Lookup)**

Before running, download the latest OUI database for MAC address vendor identification:

```bash
cd scripts
node download-oui.js

# Output: oui.json (50MB+) downloaded and cached
```

### **Data Injection & Testing**

#### **Option 1: Use ESP32 Simulator**
Simulate multiple ESP32 sniffers sending frame data:
```bash
cd scripts
node esp32-simulator.js --count 5 --interval 2000 --server http://localhost:3001
```

This generates realistic packet metadata and sends to the ingestion API.

#### **Option 2: Manual HTTP POST**
```bash
curl -X POST http://localhost:3001/packets \
  -H "Content-Type: application/json" \
  -d '{
    "mac_address": "aa:bb:cc:dd:ee:ff",
    "rssi": -45,
    "frame_type": "beacon",
    "ssid": "TestNetwork",
    "timestamp": '$(date +%s000)',
    "channel": 6,
    "flags": ["encrypted"]
  }'
```

#### **Option 3: Use Kafka Client**
```bash
# Publish to Kafka directly
docker-compose -f infra/docker-compose.yml exec kafka \
  kafka-console-producer --broker-list localhost:9092 --topic packet-metadata
```

### **Monitoring & Observability**

#### **Prometheus Metrics**
```bash
# Access Prometheus UI
open http://localhost:9090

# Query service metrics:
# - http_request_duration_seconds
# - kafka_consumer_lag
# - mongodb_connections
# - anomaly_detection_duration_seconds
```

#### **Grafana Dashboards**
```bash
# Access Grafana
open http://localhost:3000
# Default: admin / admin

# Dashboards available:
# - Network Health Overview
# - Device Activity Timeline
# - Alert History
# - Kafka Consumer Lag
```

#### **Log Aggregation**
```bash
# View all service logs
docker-compose -f infra/docker-compose.yml logs -f

# View specific service logs
docker-compose -f infra/docker-compose.yml logs -f backend-api
```

### **Stopping Services**

```bash
# Stop Docker Compose services
docker-compose -f infra/docker-compose.yml down

# Remove volumes (warning: deletes data)
docker-compose -f infra/docker-compose.yml down -v

# Scale down Kubernetes deployment
kubectl scale deployment/ingestion-api --replicas=0 -n iot-monitoring
```

---

## 📊 API Documentation

### **Ingestion API** (Receives ESP32 Data)
```
POST /packets
Content-Type: application/json

{
  "mac_address": "aa:bb:cc:dd:ee:ff",
  "rssi": -45,
  "frame_type": "beacon|data|auth",
  "ssid": "NetworkName",
  "timestamp": 1672531200000,
  "channel": 6,
  "flags": ["encrypted", "hidden_ssid"]
}

Response: 200 OK
```

### **Backend API** (Client Queries)
```
GET /devices
Response: [{id, mac, vendor, first_seen, last_seen}, ...]

GET /devices/:mac/stats
Response: {mac, vendor, packet_count, avg_rssi, last_rssi, alerts}

GET /alerts
Response: [{id, type, severity, mac, timestamp, reason}, ...]

GET /anomalies
Response: [{id, type, mac, rssi, description, severity}, ...]
```

---

## 🔒 Security Features

- **Privacy-First**: No payload inspection, only metadata analysis
- **Network Segmentation**: Kubernetes network policies isolate services
- **RSSI-based Anomaly Detection**: Detect spoofing attempts
- **MAC Address Validation**: OUI verification against known vendors
- **Rate Limiting**: Ingestion API protects against DDoS
- **Encrypted Communications**: HTTPS support for all APIs
- **Access Control**: Backend API authentication (JWT support)

---

## 📈 Scalability & Performance

- **Horizontal Scaling**: All services deployable as multiple replicas in K8s
- **Kafka Partitioning**: Packet topics partitioned by MAC for parallelism
- **MongoDB Indexing**: Optimized queries on mac_address, timestamp
- **Load Balancing**: K8s ingress distributes traffic
- **Resource Limits**: CPU/Memory constraints per container
- **Observability**: Complete metrics, logs, and traces

---

## 📝 Development Workflow

```
1. Modify code in services/*
2. Test locally with Docker Compose
3. Verify with ESP32 simulator
4. Deploy to Kubernetes
5. Monitor with Grafana/Prometheus
6. Iterate based on metrics
```

---

## 📚 References

- **802.11 Specification**: IEEE 802.11-2020
- **Kafka Documentation**: https://kafka.apache.org
- **Kubernetes Networking**: https://kubernetes.io/docs/concepts/services-networking/
- **MongoDB Aggregation**: https://docs.mongodb.com/manual/aggregation/
- **Prometheus Monitoring**: https://prometheus.io/docs/

---

## 📄 License

MIT License - See LICENSE file for details
   React dashboard displays:

   * Active devices
   * RSSI trends
   * Alerts

---

## 🧩 Core Components

### 1. ESP32 Sniffer Nodes

* Operate in promiscuous mode
* Capture Wi-Fi packet metadata
* Lightweight and distributed

---

### 2. Ingestion Service

* Receives HTTP POST data from ESP32
* Validates and forwards to Kafka
* Stateless and horizontally scalable

---

### 3. Message Queue (Apache Kafka)

* Handles high-throughput data ingestion
* Decouples producers and consumers
* Enables scalability and fault tolerance

---

### 4. Processing Service

* Consumes Kafka messages
* Implements anomaly detection logic:

  * New device detection
  * Device disappearance
  * RSSI fluctuation anomalies
  * Traffic spikes

---

### 5. Database (MongoDB)

* Stores processed device data
* Enables querying and historical analysis

---

### 6. Backend API

* Provides REST endpoints:

  * `/devices`
  * `/alerts`
* Acts as bridge between data layer and frontend

---

### 7. Frontend Dashboard

* Built with React
* Displays:

  * Real-time device list
  * Signal strength trends
  * Alerts panel

---

## ⚙️ DevOps & Deployment

### Containerization

* All services containerized using Docker

### Orchestration

* Deployed on Kubernetes:

  * Deployments
  * Services
  * Ingress

### CI/CD

* Automated using GitHub Actions:

  * Build
  * Test
  * Deploy

---

## 📊 Observability

* Metrics exposed from services:

  * `packets_received_total`
  * `devices_detected`
  * `anomalies_detected`

* Monitoring stack:

  * Prometheus → Metrics collection
  * Grafana → Visualization dashboards

---

## 🔐 Security Considerations

* No payload inspection (privacy-safe)
* Only metadata is processed
* TLS used for backend communication
* Kubernetes RBAC for access control

---

## ⚠️ Limitations

* Cannot decrypt HTTPS traffic
* ESP32 hardware limitations (memory, CPU)
* Limited to Wi-Fi-based monitoring
* Accuracy depends on deployment density

---

## 🚀 Future Enhancements

* Machine Learning-based anomaly detection
* RSSI-based location estimation
* Integration with Istio for Kubernetes traffic observability
* Cloud deployment (AWS/GCP/Azure)
* Mobile dashboard application

---

## 📌 Summary

This system demonstrates a **modern DevOps + Networking solution** by combining:

* IoT-based packet sniffing
* Streaming architecture
* Microservices design
* Kubernetes deployment
* Real-time observability

It provides a scalable and privacy-aware approach to network monitoring suitable for smart environments and research applications.

---

## Contributors

Omkar Patil, Smrutikant Parida, Paras Sarode, Omar Khan, Kushal Kurkure

---
