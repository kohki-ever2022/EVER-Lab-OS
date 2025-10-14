import {
  Role, RoleCategory, Language, View, Result,
  User, Company, Plan, Qualification, Shift, UserCertification, UserCourseProgress, Tenant, Course,
  Announcement, SystemSettings, Memo, FixedOption, BenchAssignment, Notification, AuditLog, ContractType, UserAvailabilityStatus, TenantLifecycleStage,
  Equipment, Reservation, Usage, MaintenanceLog, EquipmentStatus, EquipmentManual, WaitlistEntry, WorkOrder, CalibrationRecord, SparePart, CO2IncubatorTracking, ReservationStatus, MaintenanceLogStatus,
  Invoice, InvoiceStatus, TaxRate,
  Project, Protocol, SampleLot, ProtocolUsageLog, Task, PipelineItem, Freezer, FreezerRack, SampleBox, Vial, VialStatus, TemperatureLog, LabNotebookEntry, TaskStatus, TaskPriority, TaskScope, MilestoneStatus,
  Consumable, PurchaseOrder, Order, PurchaseOrderLine, OrderStatus, Supplier, Quotation, QuotationStatus, Inquiry, InquiryStatus, InventorySnapshot, ExpenseType, ConsumableNotification,
  ControlledDocument, DocumentVersion, Deviation, Capa, ChangeRequest, ReadReceipt, LegalDocument, LegalClause, LegalDocumentType, LegalDocumentStatus, ApprovalStatus, EhsIncident, EhsIncidentType, EhsIncidentStatus, RiskLikelihood, RiskSeverity, RiskLevel, Budget, BudgetType, WasteChemical, WasteContainer, WastePickupSchedule, WasteManifest, WasteStreamType, WasteContainerStatus, WastePickupStatus, Ticket, KnowledgeBaseArticle, CsatSurvey, TicketCategory, TicketStatus, TicketPriority, SDS, Certificate, CertificateStatus, RegulatoryRequirement, RegulationType, SubmissionStatus, InsuranceCertificate, InsuranceType, Manual, ManualCategory, ManualTargetAudience, LabRule, LabRuleCategory, RuleImportance,
  ChatRoom, ChatMessage
} from '../types';


/**
 * Provides the initial mock data for the application context.
 * In a real application, this would likely be replaced by API calls.
 * This function returns an empty or minimal dataset to ensure the application
 * can start without errors.
 */
export function getMockData() {
    const plans: Plan[] = [
        {
            id: 'plan-standard',
            nameJP: '標準プラン',
            nameEN: 'Standard Plan',
            monthlyFee: 100000,
            detailsJP: '基本的な機能を利用できます。',
            detailsEN: 'Access to basic features.',
            maxConcurrentUsers: 5,
            allowedHoursStart: "09:00",
            allowedHoursEnd: "21:00",
        },
    ];

    const companies: Company[] = [
        { id: 'company-lab', nameJP: 'EVER株式会社', nameEN: 'EVER, Inc.', planId: 'plan-standard', consolidatedBilling: false, contractType: ContractType.Annual, contractStartDate: new Date('2023-04-01'), registrationNumber: 'T1234567890123', isActive: true, mfPartnerId: 'mf-partner-ever' },
        { id: 'company-a', nameJP: 'テナントA株式会社', nameEN: 'Tenant A, Inc.', planId: 'plan-standard', consolidatedBilling: true, contractType: ContractType.Monthly, contractStartDate: new Date('2023-06-01'), billingEmail: 'billing@tenant-a.com', registrationNumber: 'T1112223334445', isActive: true, mfPartnerId: 'mf-partner-a' },
        { id: 'company-b', nameJP: '株式会社BioFuture', nameEN: 'BioFuture Ltd.', planId: 'plan-standard', consolidatedBilling: true, contractType: ContractType.Monthly, contractStartDate: new Date('2023-08-01'), billingEmail: 'accounts@biofuture.com', registrationNumber: 'T5556667778889', isActive: true, mfPartnerId: 'mf-partner-b' },
        { id: 'company-c', nameJP: 'Pharma Solutions', nameEN: 'Pharma Solutions', planId: 'plan-standard', consolidatedBilling: false, contractType: ContractType.Monthly, contractStartDate: new Date('2023-09-01'), billingEmail: 'finance@pharma.com', registrationNumber: 'T9998887776665', isActive: false, mfPartnerId: 'mf-partner-c' },
        { id: 'company-s', nameJP: 'サプライヤー株式会社', nameEN: 'Supplier Inc.', planId: 'plan-standard', consolidatedBilling: false, contractType: ContractType.Monthly, contractStartDate: new Date('2023-01-01'), isActive: true },
    ];
    
    const equipment: Equipment[] = [
        // ... some existing equipment
        { id: 'eq-freezer-01', nameJP: '-80℃ フリーザー', nameEN: '-80°C Freezer', categoryJP: '保管', categoryEN: 'Storage', status: EquipmentStatus.InUse, rate: 0, rateUnitJP: '', rateUnitEN: '', granularity: '', imageUrl: 'https://images.unsplash.com/photo-1628744448592-a185123c5333?q=80&w=800', isReservable: false },
        { id: 'eq-incubator-02', nameJP: 'CO2インキュベーター', nameEN: 'CO2 Incubator', categoryJP: '培養', categoryEN: 'Culture', status: EquipmentStatus.InUse, rate: 0, rateUnitJP: '', rateUnitEN: '', granularity: '', imageUrl: 'https://images.unsplash.com/photo-1635051910633-65e378255933?q=80&w=800', isReservable: false },
        { id: 'some-other-incubator-id', nameJP: 'CO2インキュベーター #2', nameEN: 'CO2 Incubator #2', categoryJP: '培養', categoryEN: 'Culture', status: EquipmentStatus.InUse, rate: 0, rateUnitJP: '', rateUnitEN: '', granularity: '', imageUrl: 'https://images.unsplash.com/photo-1635051910633-65e378255933?q=80&w=800', isReservable: false },
        { id: 'yet-another-incubator-id', nameJP: 'CO2インキュベーター #3', nameEN: 'CO2 Incubator #3', categoryJP: '培養', categoryEN: 'Culture', status: EquipmentStatus.Maintenance, rate: 0, rateUnitJP: '', rateUnitEN: '', granularity: '', imageUrl: 'https://images.unsplash.com/photo-1635051910633-65e378255933?q=80&w=800', isReservable: false },
        { id: 'eq-bsc-01', nameJP: '安全キャビネット', nameEN: 'Biosafety Cabinet', categoryJP: '培養', categoryEN: 'Culture', status: EquipmentStatus.Available, rate: 1000, rateUnitJP: '¥/時間', rateUnitEN: '¥/hour', granularity: '', imageUrl: 'https://images.unsplash.com/photo-1628744448592-a185123c5333?q=80&w=800', isReservable: true, requiredQualificationId: 'qual-bsl2', manualIds: ['manual-002'] },
    ];
    
    const qualifications: Qualification[] = [
        { id: 'qual-bsl2', nameJP: 'BSL-2 利用資格', nameEN: 'BSL-2 Certification' },
        { id: 'qual-autoclave', nameJP: 'オートクレーブ利用資格', nameEN: 'Autoclave Certification' },
    ];
    
    const userCertifications: UserCertification[] = [
        { id: 'cert-1', userId: 'user-director', qualificationId: 'qual-bsl2', issuedAt: new Date('2023-01-01'), expiresAt: new Date('2025-01-01'), courseId: 'course-bsl2' },
        { id: 'cert-2', userId: 'user-director', qualificationId: 'qual-autoclave', issuedAt: new Date('2023-01-01'), expiresAt: new Date('2025-01-01'), courseId: 'course-autoclave' },
        { id: 'cert-3', userId: 'user-pm-a', qualificationId: 'qual-bsl2', issuedAt: new Date('2023-01-01'), expiresAt: new Date('2025-01-01'), courseId: 'course-bsl2' },
        { id: 'cert-4', userId: 'user-pm-b', qualificationId: 'qual-bsl2', issuedAt: new Date('2023-01-01'), expiresAt: new Date('2025-01-01'), courseId: 'course-bsl2' },
        { id: 'cert-5', userId: 'user-pm-b', qualificationId: 'qual-autoclave', issuedAt: new Date('2023-01-01'), expiresAt: new Date('2025-01-01'), courseId: 'course-autoclave' },
    ];

    const users: User[] = [
        // Facility Staff
        { id: 'user-director', name: 'Taro Suzuki', email: 'taro.suzuki@ever.com', companyId: 'company-lab', role: Role.FacilityDirector, roleCategory: RoleCategory.Facility, availabilityStatus: UserAvailabilityStatus.Available, qualificationIds: ['qual-bsl2', 'qual-autoclave'] },
        { id: 'user-lab-manager', name: 'Jiro Tanaka', email: 'jiro.tanaka@ever.com', companyId: 'company-lab', role: Role.LabManager, roleCategory: RoleCategory.Facility, availabilityStatus: UserAvailabilityStatus.Busy, statusMessage: 'Meeting until 3pm', qualificationIds: ['qual-bsl2', 'qual-autoclave'] },
    
        // Tenant A
        { id: 'user-pm-a', name: 'Hanako Yamada', email: 'hanako.yamada@tenant-a.com', companyId: 'company-a', role: Role.ProjectManager, roleCategory: RoleCategory.Tenant, qualificationIds: ['qual-bsl2'] },
        { id: 'user-res-a', name: 'Ichiro Sato', email: 'ichiro.sato@tenant-a.com', companyId: 'company-a', role: Role.Researcher, roleCategory: RoleCategory.Tenant },
    
        // Tenant B
        { id: 'user-pm-b', name: 'John Doe', email: 'john.doe@biofuture.com', companyId: 'company-b', role: Role.ProjectManager, roleCategory: RoleCategory.Tenant, qualificationIds: ['qual-bsl2', 'qual-autoclave'] },
        { id: 'user-res-b', name: 'Jane Smith', email: 'jane.smith@biofuture.com', companyId: 'company-b', role: Role.Researcher, roleCategory: RoleCategory.Tenant },
    
        // Supplier
        { id: 'user-supplier', name: 'Supplier Rep', email: 'rep@supplier.com', companyId: 'company-s', role: Role.Supplier, roleCategory: RoleCategory.External },
    ];
    
    const projects: Project[] = [
        { id: 'proj-a1', name: '細胞株開発プロジェクト', description: '新しい抗体医薬のための細胞株を開発する。', companyId: 'company-a', memberIds: ['user-pm-a', 'user-res-a'], 
            milestones: [
                { id: 'm1', name: 'Phase 1', dueDate: new Date('2024-07-30'), status: MilestoneStatus.Completed },
                { id: 'm2', name: 'Phase 2', dueDate: new Date('2024-09-15'), status: MilestoneStatus.InProgress },
                { id: 'm3', name: 'Phase 3', dueDate: new Date('2024-11-30'), status: MilestoneStatus.Pending },
            ] 
        },
        { id: 'proj-b1', name: 'Gene Editing Research', description: 'CRISPR-Cas9 technology for new therapeutic approaches.', companyId: 'company-b', memberIds: ['user-pm-b', 'user-res-b'], 
            milestones: [
                { id: 'm4', name: 'Pre-clinical', dueDate: new Date('2024-08-20'), status: MilestoneStatus.InProgress },
                { id: 'm5', name: 'Tox Study', dueDate: new Date('2024-10-10'), status: MilestoneStatus.Pending },
            ]
        },
    ];

    const tasks: Task[] = [
        { id: 't1', title: '細胞培養開始', projectId: 'proj-a1', status: TaskStatus.Done, priority: TaskPriority.High, scope: TaskScope.Team, assigneeIds: ['user-res-a'], startDate: new Date('2024-07-01'), dueDate: new Date('2024-07-05'), isPrivate: false, createdByUserId: 'user-pm-a', createdAt: new Date(), updatedAt: new Date() },
        { id: 't2', title: '一次スクリーニング', projectId: 'proj-a1', status: TaskStatus.InProgress, priority: TaskPriority.High, scope: TaskScope.Team, assigneeIds: ['user-res-a'], startDate: new Date('2024-07-06'), dueDate: new Date('2024-07-20'), isPrivate: false, createdByUserId: 'user-pm-a', createdAt: new Date(), updatedAt: new Date() },
        { id: 't3', title: 'データ解析', projectId: 'proj-a1', status: TaskStatus.ToDo, priority: TaskPriority.Medium, scope: TaskScope.Team, assigneeIds: ['user-pm-a'], startDate: new Date('2024-07-21'), dueDate: new Date('2024-07-28'), isPrivate: false, createdByUserId: 'user-pm-a', createdAt: new Date(), updatedAt: new Date() },
        { id: 't4', title: 'Design gRNA sequences', projectId: 'proj-b1', status: TaskStatus.Done, priority: TaskPriority.High, scope: TaskScope.Team, assigneeIds: ['user-res-b'], startDate: new Date('2024-07-10'), dueDate: new Date('2024-07-18'), isPrivate: false, createdByUserId: 'user-pm-b', createdAt: new Date(), updatedAt: new Date() },
        { id: 't5', title: 'Transfection experiment', projectId: 'proj-b1', status: TaskStatus.InProgress, priority: TaskPriority.High, scope: TaskScope.Team, assigneeIds: ['user-res-b'], startDate: new Date('2024-07-20'), dueDate: new Date('2024-08-05'), isPrivate: false, createdByUserId: 'user-pm-b', createdAt: new Date(), updatedAt: new Date() },
        { id: 't6', title: 'Review results', projectId: 'proj-b1', status: TaskStatus.ToDo, priority: TaskPriority.Medium, scope: TaskScope.Team, assigneeIds: ['user-pm-b', 'user-res-b'], startDate: new Date('2024-08-06'), dueDate: new Date('2024-08-10'), isPrivate: false, createdByUserId: 'user-pm-b', createdAt: new Date(), updatedAt: new Date() },
    ];

    const regulatoryRequirements: RegulatoryRequirement[] = [
      {
        id: 'reg-1',
        tenantId: 'company-a',
        type: RegulationType.SafetyHealthLaw,
        requirementName: 'Health Committee Meeting Minutes',
        requirementNameJP: '衛生委員会議事録',
        requirementNameEN: 'Health Committee Meeting Minutes',
        description: 'Monthly submission of meeting minutes for companies with 50+ employees.',
        descriptionJP: '従業員50名以上の事業場で毎月提出が必要な議事録。',
        descriptionEN: 'Monthly submission of meeting minutes for companies with 50+ employees.',
        isApplicable: true,
        submissionAuthority: '労働基準監督署',
        submissionDeadline: new Date('2024-07-31'),
        submissionStatus: SubmissionStatus.Preparing,
        lastUpdated: new Date(),
      },
      {
        id: 'reg-2',
        tenantId: 'company-b',
        type: RegulationType.CartegenaLaw,
        requirementName: 'Type 2 Use Experiment Plan',
        requirementNameJP: '第二種使用等実験計画書',
        requirementNameEN: 'Type 2 Use Experiment Plan',
        description: 'Submission for experiments using specified genetically modified organisms.',
        descriptionJP: '特定の遺伝子組換え生物を使用する実験の届出。',
        descriptionEN: 'Submission for experiments using specified genetically modified organisms.',
        isApplicable: true,
        submissionAuthority: '文部科学省',
        submissionStatus: SubmissionStatus.Approved,
        lastUpdated: new Date(),
      },
       {
        id: 'reg-3',
        tenantId: 'company-a',
        type: RegulationType.FireServiceLaw,
        requirementName: 'Hazardous Materials Storage Report',
        requirementNameJP: '危険物貯蔵・取扱届出',
        requirementNameEN: 'Hazardous Materials Storage Report',
        description: 'Report for storing hazardous materials exceeding designated quantities.',
        descriptionJP: '指定数量以上の危険物を貯蔵・取り扱う場合の届出。',
        descriptionEN: 'Report for storing hazardous materials exceeding designated quantities.',
        isApplicable: true,
        submissionAuthority: '所轄消防署',
        submissionDeadline: new Date('2024-08-15'),
        submissionStatus: SubmissionStatus.Required,
        lastUpdated: new Date(),
      },
  ];

  const insuranceCertificates: InsuranceCertificate[] = [
    {
      id: 'ins-cert-1',
      tenantId: 'company-a',
      type: InsuranceType.Liability,
      insuranceCompany: '東京海上日動火災保険',
      policyNumber: 'POLICY-12345',
      coverageAmount: 100000000,
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      certificateUrl: '#',
      uploadedDate: new Date('2023-03-20'),
      uploadedBy: 'user-pm-a',
      verifiedBy: 'user-lab-manager',
      verifiedDate: new Date('2023-04-01'),
      status: 'EXPIRED'
    },
    {
      id: 'ins-cert-2',
      tenantId: 'company-a',
      type: InsuranceType.Liability,
      insuranceCompany: '東京海上日動火災保険',
      policyNumber: 'POLICY-56789',
      coverageAmount: 100000000,
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      certificateUrl: '#',
      uploadedDate: new Date('2024-03-21'),
      uploadedBy: 'user-pm-a',
      verifiedBy: 'user-lab-manager',
      verifiedDate: new Date('2024-04-02'),
      status: 'VERIFIED'
    },
    {
      id: 'ins-cert-3',
      tenantId: 'company-b',
      type: InsuranceType.ProductLiability,
      insuranceCompany: '三井住友海上火災保険',
      policyNumber: 'POLICY-ABCDE',
      coverageAmount: 50000000,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-07-31'),
      certificateUrl: '#',
      uploadedDate: new Date('2024-07-20'),
      uploadedBy: 'user-pm-b',
      status: 'PENDING'
    }
  ];
    
    const co2IncubatorTrackingData: CO2IncubatorTracking[] = [
        {
          id: 'co2-track-1',
          equipmentId: 'eq-incubator-02',
          equipmentName: 'CO2 Incubator',
          gasType: 'CO2',
          cylinderSize: 40, // kg
          currentLevel: 15.5, // kg
          minimumLevel: 5, // kg
          lastMeasuredDate: new Date(new Date().setDate(new Date().getDate() - 2)),
          lastMeasuredBy: 'user-lab-manager',
          previousLevel: 16.2,
          previousDate: new Date(new Date().setDate(new Date().getDate() - 9)),
          estimatedEmptyDate: new Date(new Date().setDate(new Date().getDate() + 150)),
          alertTriggered: false,
          notes: 'Usage seems normal.',
          replacementScheduled: false,
        },
        {
          id: 'co2-track-2',
          equipmentId: 'some-other-incubator-id', // Assuming another incubator exists
          equipmentName: 'CO2 Incubator #2',
          gasType: 'CO2',
          cylinderSize: 40,
          currentLevel: 8.1,
          minimumLevel: 5,
          lastMeasuredDate: new Date(new Date().setDate(new Date().getDate() - 1)),
          lastMeasuredBy: 'user-lab-manager',
          previousLevel: 9.0,
          previousDate: new Date(new Date().setDate(new Date().getDate() - 5)),
          estimatedEmptyDate: new Date(new Date().setDate(new Date().getDate() + 35)),
          alertTriggered: true,
          alertDate: new Date(),
          notes: 'Usage is higher than expected.',
          replacementScheduled: false,
        },
        {
            id: 'co2-track-3',
            equipmentId: 'yet-another-incubator-id',
            equipmentName: 'CO2 Incubator #3',
            gasType: 'CO2',
            cylinderSize: 40,
            currentLevel: 4.5,
            minimumLevel: 5,
            lastMeasuredDate: new Date(),
            lastMeasuredBy: 'user-lab-manager',
            previousLevel: 5.0,
            previousDate: new Date(new Date().setDate(new Date().getDate() - 2)),
            estimatedEmptyDate: new Date(new Date().setDate(new Date().getDate() + 18)),
            alertTriggered: true,
            alertDate: new Date(),
            notes: 'Critically low.',
            replacementScheduled: true,
            replacementDate: new Date(new Date().setDate(new Date().getDate() + 3)),
          }
      ];

const manuals: Manual[] = [
    {
      id: 'manual-001',
      category: ManualCategory.GettingStarted,
      targetAudience: ManualTargetAudience.NewUsers,
      title: 'EVER-Lab OS Quick Start Guide',
      titleJP: 'EVER-Lab OS クイックスタートガイド',
      titleEN: 'EVER-Lab OS Quick Start Guide',
      description: 'A guide for new users to get started with the lab management system.',
      descriptionJP: '新規ユーザーがラボ管理システムを使い始めるためのガイドです。',
      descriptionEN: 'A guide for new users to get started with the lab management system.',
      content: '## Welcome to EVER-Lab OS\n\nThis guide will walk you through the basic features...',
      contentJP: '## EVER-Lab OSへようこそ\n\nこのガイドでは基本的な機能について説明します...',
      contentEN: '## Welcome to EVER-Lab OS\n\nThis guide will walk you through the basic features...',
      attachments: [],
      version: '1.1.0',
      versionHistory: [],
      author: 'user-lab-manager',
      createdAt: new Date('2023-10-01'),
      updatedAt: new Date('2024-05-20'),
      isPublished: true,
      viewCount: 152,
      tags: ['getting started', 'guide', 'new user'],
      tagsJP: ['はじめに', 'ガイド', '新規ユーザー'],
      tagsEN: ['getting started', 'guide', 'new user'],
      relatedManuals: ['manual-002'],
    },
    {
      id: 'manual-002',
      category: ManualCategory.EquipmentOperation,
      targetAudience: ManualTargetAudience.AllUsers,
      title: 'BSC-01 Biosafety Cabinet Operation',
      titleJP: 'BSC-01 安全キャビネット操作マニュアル',
      titleEN: 'BSC-01 Biosafety Cabinet Operation',
      description: 'Standard Operating Procedure (SOP) for the BSC-01 model.',
      descriptionJP: 'BSC-01モデルの標準作業手順書（SOP）です。',
      descriptionEN: 'Standard Operating Procedure (SOP) for the BSC-01 model.',
      content: '### Before Use\n1. Check the pressure gauge...\n2. Turn on the UV light for 15 minutes...',
      contentJP: '### 使用前\n1. 圧力計を確認してください...\n2. 15分間UVライトを点灯させてください...',
      contentEN: '### Before Use\n1. Check the pressure gauge...\n2. Turn on the UV light for 15 minutes...',
      attachments: [
        { id: 'att-01', fileName: 'BSC-01_diagram.pdf', fileUrl: '#', fileType: 'PDF', fileSize: 1024 * 512, uploadedAt: new Date(), uploadedBy: 'user-lab-manager' }
      ],
      version: '2.0.0',
      versionHistory: [],
      author: 'user-lab-manager',
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2024-06-01'),
      isPublished: true,
      viewCount: 340,
      tags: ['bsc', 'sop', 'biosafety'],
      tagsJP: ['安全キャビネット', 'SOP', 'BSC'],
      tagsEN: ['bsc', 'sop', 'biosafety'],
      relatedManuals: [],
      relatedEquipment: ['eq-bsc-01'],
    },
    {
      id: 'manual-003',
      category: ManualCategory.FacilityStaffGuide,
      targetAudience: ManualTargetAudience.FacilityStaff,
      title: 'Emergency Shutdown Protocol',
      titleJP: '緊急停止プロトコル',
      titleEN: 'Emergency Shutdown Protocol',
      description: 'Procedures for facility staff during an emergency power outage or other critical events.',
      descriptionJP: '緊急停電やその他の重大なイベント発生時における施設スタッフ向けの手順書。',
      descriptionEN: 'Procedures for facility staff during an emergency power outage or other critical events.',
      content: '## In case of emergency...\n1. Activate the central shutdown switch...',
      contentJP: '## 緊急事態が発生した場合...\n1. 中央シャットダウンスイッチを作動させてください...',
      contentEN: '## In case of emergency...\n1. Activate the central shutdown switch...',
      attachments: [],
      version: '1.0.0',
      versionHistory: [],
      author: 'user-director',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isPublished: true,
      viewCount: 12,
      tags: ['emergency', 'safety', 'staff'],
      tagsJP: ['緊急', '安全', 'スタッフ'],
      tagsEN: ['emergency', 'safety', 'staff'],
      relatedManuals: [],
    },
];

const labRules: LabRule[] = [
    {
      id: 'rule-001',
      category: LabRuleCategory.GeneralConduct,
      importance: RuleImportance.Mandatory,
      ruleNumber: '1.1',
      title: 'Lab Coat and PPE',
      titleJP: '白衣と個人防護具(PPE)の着用',
      titleEN: 'Lab Coat and PPE',
      description: 'Lab coats must be worn at all times in the laboratory areas. Appropriate eye protection and gloves are required when handling chemicals or biological materials.',
      descriptionJP: 'ラボエリアでは常に白衣を着用してください。化学物質や生物学的材料を取り扱う際は、適切な保護メガネと手袋が必要です。',
      descriptionEN: 'Lab coats must be worn at all times in the laboratory areas. Appropriate eye protection and gloves are required when handling chemicals or biological materials.',
      targetAudience: ManualTargetAudience.AllUsers,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'user-director',
      relatedManuals: [],
      relatedRules: [],
      acknowledgedBy: [
        { userId: 'user-director', userName: 'Taro Suzuki', acknowledgedAt: new Date(), ruleVersion: '1.0' },
        { userId: 'user-lab-manager', userName: 'Jiro Tanaka', acknowledgedAt: new Date(), ruleVersion: '1.0' },
      ], // user-pm-a has not acknowledged
    },
    {
      id: 'rule-002',
      category: LabRuleCategory.EquipmentUsage,
      importance: RuleImportance.Recommended,
      ruleNumber: '3.1',
      title: 'Equipment Reservation',
      titleJP: '機器予約のルール',
      titleEN: 'Equipment Reservation',
      description: 'Please book equipment in advance using the EVER-Lab OS. Cancel reservations if you no longer need the equipment to free it up for others.',
      descriptionJP: '機器はEVER-Lab OSを使用して事前に予約してください。不要になった予約はキャンセルし、他の人が利用できるようにしてください。',
      descriptionEN: 'Please book equipment in advance using the EVER-Lab OS. Cancel reservations if you no longer need the equipment to free it up for others.',
      targetAudience: ManualTargetAudience.AllUsers,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'user-lab-manager',
      relatedManuals: [],
      relatedRules: [],
      acknowledgedBy: [],
    },
    {
      id: 'rule-003',
      category: LabRuleCategory.SafetyRules,
      importance: RuleImportance.Mandatory,
      ruleNumber: '2.1',
      title: 'BSL-2 Area Entry',
      titleJP: 'BSL-2エリアへの入室',
      titleEN: 'BSL-2 Area Entry',
      description: 'Only authorized personnel with valid BSL-2 training may enter the BSL-2 area. Always sign in and out.',
      descriptionJP: '有効なBSL-2トレーニングを受けた認定担当者のみがBSL-2エリアに入室できます。常に入退室を記録してください。',
      descriptionEN: 'Only authorized personnel with valid BSL-2 training may enter the BSL-2 area. Always sign in and out.',
      targetAudience: ManualTargetAudience.Tenants,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      createdBy: 'user-director',
      relatedManuals: ['manual-002'],
      relatedRules: [],
      acknowledgedBy: [],
    },
];

const labNotebookEntries: LabNotebookEntry[] = [
    {
        id: 'eln-1',
        userId: 'user-res-a',
        projectId: 'proj-a1',
        title: '細胞株A-3の継代培養',
        content: '### 目的\n細胞株A-3を次の実験のために増やす。\n\n### 手順\n1. 培地を37℃に温める。\n2. 細胞をPBSで洗浄。\n3. トリプシン処理 (5分)。\n4. 遠心分離 (1500rpm, 3分)。\n5. 新しいフラスコに細胞を播種。\n\n### 結果\n顕微鏡観察で細胞のコンフルエンシーが約80%であることを確認。汚染は見られなかった。',
        experimentDate: new Date(new Date().setDate(new Date().getDate() - 2)),
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        tags: ['細胞培養', '継代', 'A-3'],
        attachments: [],
        relatedEquipment: ['eq-bsc-01', 'eq-incubator-02'],
        relatedSamples: []
    },
    {
        id: 'eln-2',
        userId: 'user-res-a',
        projectId: 'proj-a1',
        title: '抗体精製プロトコルの検討',
        content: '## 背景\n新しい抗体Xの精製条件を最適化する。\n\n## 方法\n- プロテインAカラムを使用。\n- 溶出バッファーのpHを5.0から3.0まで段階的に変更。\n\n## 考察\npH 4.0で最も収率が高く、純度も良好だった。次回はこの条件でスケールアップを試みる。',
        experimentDate: new Date(new Date().setDate(new Date().getDate() - 5)),
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)),
        updatedAt: new Date(new Date().setDate(new Date().getDate() - 4)),
        tags: ['抗体精製', 'プロテインA', '最適化'],
        attachments: ['result_graph.png'],
        relatedEquipment: [],
        relatedSamples: []
    }
];

const chatRooms: ChatRoom[] = [
    {
        id: 'room-1',
        type: 'TENANT_TO_FACILITY',
        participantIds: ['user-pm-a', 'user-lab-manager'],
        tenantId: 'company-a',
        subject: 'BSL-2利用申請について',
        lastMessageAt: new Date(new Date().setHours(new Date().getHours() - 1)),
        lastMessage: '承知いたしました。申請内容を確認いたします。',
        unreadCount: { 'user-pm-a': 1, 'user-lab-manager': 0 },
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
        updatedAt: new Date(new Date().setHours(new Date().getHours() - 1)),
    },
    {
        id: 'room-2',
        type: 'INTERNAL',
        participantIds: ['user-pm-b', 'user-res-b'],
        tenantId: 'company-b',
        subject: 'Gene Editing Project Weekly Sync',
        lastMessageAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
        lastMessage: 'OK, see you then.',
        unreadCount: { 'user-pm-b': 0, 'user-res-b': 0 },
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
        updatedAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
    },
];

const chatMessages: ChatMessage[] = [
    {
        id: 'msg-1',
        roomId: 'room-1',
        senderId: 'user-pm-a',
        content: 'お世話になっております。先日申請したBSL-2エリアの利用許可について、進捗はいかがでしょうか？',
        createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
        readBy: ['user-pm-a', 'user-lab-manager'],
    },
    {
        id: 'msg-2',
        roomId: 'room-1',
        senderId: 'user-lab-manager',
        content: 'ご連絡ありがとうございます。承知いたしました。申請内容を確認いたします。',
        createdAt: new Date(new Date().setHours(new Date().getHours() - 1)),
        readBy: ['user-lab-manager'],
    },
    {
        id: 'msg-3',
        roomId: 'room-2',
        senderId: 'user-pm-b',
        content: 'Weekly sync tomorrow at 10 AM?',
        createdAt: new Date(new Date().setHours(new Date().getHours() - 3)),
        readBy: ['user-pm-b', 'user-res-b'],
    },
    {
        id: 'msg-4',
        roomId: 'room-2',
        senderId: 'user-res-b',
        content: 'OK, see you then.',
        createdAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
        readBy: ['user-pm-b', 'user-res-b'],
    }
];

//... rest of the mock data
    return {
        plans,
        companies,
        users,
        equipment,
        reservations: [],
        usage: [],
        announcements: [],
        systemSettings: { labOpeningTime: '09:00', labClosingTime: '21:00', noShowPenalty: 1000, surgePricingEnabled: false, surgeMultiplier: 1.5, surgeStartTime: '18:00', surgeEndTime: '21:00'},
        taxRates: [],
        maintenanceLogs: [],
        projects,
        consumables: [],
        purchaseOrders: [],
        qualifications,
        suppliers: [],
        quotations: [],
        inquiries: [],
        shifts: [],
        memos: [],
        protocols: [],
        sampleLots: [],
        protocolUsageLogs: [],
        fixedOptions: [],
        benchAssignments: [],
        equipmentManuals: [],
        tasks,
        pipelineItems: [],
        notifications: [],
        auditLogs: [],
        invoices: [],
        controlledDocuments: [],
        documentVersions: [],
        deviations: [],
        capas: [],
        changeRequests: [],
        readReceipts: [],
        courses: [],
        userCertifications,
        userCourseProgresses: [],
        waitlist: [],
        workOrders: [],
        calibrationRecords: [],
        spareParts: [],
        tenants: [],
        legalDocuments: [],
        legalClauses: [],
        freezers: [],
        freezerRacks: [],
        sampleBoxes: [],
        vials: [],
        temperatureLogs: [],
        ehsIncidents: [],
        budgets: [],
        wasteChemicals: [],
        wasteContainers: [],
        wastePickupSchedules: [],
        wasteManifests: [],
        tickets: [],
        knowledgeBaseArticles: [],
        csatSurveys: [],
        sds: [],
        orders: [],
        certificates: [],
        inventorySnapshots: [],
        spaceOccupyingLeases: [],
        regulatoryRequirements,
        insuranceCertificates,
        consumableNotifications: [],
        co2IncubatorTrackingData,
        manuals,
        labRules,
        labNotebookEntries,
        chatRooms,
        chatMessages,
    };
}