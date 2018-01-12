const mongoose = require('mongoose')

var Schema = mongoose.Schema
exports.User = mongoose.model('User', new Schema({
  username: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name: { type: String, required: true },
  password: { type: String, select: false },
  group: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'Group'
  },
  title: String,
  role: Number,
  email: String,
  mobiles: Array,
  note: String,
  isManager: Boolean,
  avatar: Boolean
}, {
  timestamps: true
}))

exports.Group = mongoose.model('Group', new Schema({
  name: { type: String, required: true },
  email: String,
  phone: String,
  fax: String,
  parent: { type: Schema.Types.ObjectId, ref: 'Group' },
  description: String
}, {
  timestamps: true
}))

exports.Token = mongoose.model('Token', new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.Seq = mongoose.model('Seq', new Schema({
  prefix: String,
  date: String,
  num: Number
}))

exports.Product = mongoose.model('Product', new Schema({
  model: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name: String,
  category: { type: String, required: true },
  vendor: { type: String, required: true },
  retailPrice: Number,
  finalistPrice: Number,
  parameter: String,
  description: String,
  note: String,
  isAvaiable: Boolean,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.Company = mongoose.model('Company', new Schema({
  code: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  type: { type: Number, required: true },
  category: Number,
  region: { type: String, required: true },
  address: String,
  zipcode: String,
  site: String,
  level: Number,
  fund: String,
  staff: Number,
  description: String,
  note: String,
  billing: {
    taxNum: String,
    bank: String,
    account: String,
    title: String
  },
  // contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  readers: [{
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  editors: [{
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.Contact = mongoose.model('Contact', new Schema({
  name: {
    type: String,
    index: true,
    required: true
  },
  company: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  department: String,
  title: String,
  email: String,
  phone: String,
  mobile: String,
  fax: String,
  qq: String,
  wechat: String,
  note: String,
  createdBy: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.Project = mongoose.model('Project', new Schema({
  code: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  name: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: String,
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    contactName: String,
    contactPhone: String
  },
  operator: {
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: String,
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    contactName: String,
    contactPhone: String
  },
  integrator: {
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: String,
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    contactName: String,
    contactPhone: String
  },
  vendors: [{
    company: { type: Schema.Types.ObjectId, ref: 'Company' },
    companyName: String,
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    contactName: String,
    contactPhone: String
  }],
  category: { type: Number, required: true },
  type: { type: Number, required: true },
  phase: { type: Number, required: true },
  region: { type: String, required: true },
  address: String,
  description: String,
  progress: [{
    time: Number,
    content: String
  }],
  note: String,
  feedback: String,
  step: Number,
  status: String,
  auditor: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  salesman: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  supportmen: [{
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  engineers: [{
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  inventory: {
    type: Schema.Types.ObjectId,
    ref: 'Inventory'
  },
  createdBy: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.WorkOrder = mongoose.model('WorkOrder', new Schema({
  code: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
    required: true
  },
  projectName: String,
  step: {
    type: Number,
    index: true
  },
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  companyName: String,
  contact: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
  contactName: String,
  contactPhone: String,
  type: { type: Number, required: true },
  description: { type: String, required: true },
  note: String,
  assignee: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  dispatcher: { type: Schema.Types.ObjectId, ref: 'User' },
  workers: [{
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  estimateWorkTime: String,
  auditor: { type: Schema.Types.ObjectId, ref: 'User' },
  workTime: String,
  workHours: Number,
  fault: String,
  summary: String,
  rate: Number,
  createdBy: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))

exports.Inventory = mongoose.model('Inventory', new Schema({
  code: String,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    index: true,
    required: true
  },
  projectName: String,
  note: String,
  discount: Number,
  totalPrice: Number,
  products: [{
    // _id: false,
    model: String,
    name: String,
    category: String,
    vendor: String,
    retailPrice: Number,
    finalistPrice: Number,
    unitPrice: Number,
    amount: Number,
    parameter: String,
    description: String,
    note: String
  }],
  createdBy: {
    index: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
}))