import { Queue, Worker } from 'bullmq'
import { checkExpiringDocuments, checkLegalDeadlines, deleteTrashDocuments, checkYmAlarms, checkSozlesmeAlarms, checkHakedisAcilis } from './queue-worker'

// Create connection
export const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
}

// Queue types
export interface JobData {
  type: 'belge-alarm' | 'ym-alarm' | 'hukuki-alarm' | 'sozlesme-alarm' | 'hakedis-acilis' | 'kalici-silme'
  tenantId: string
  userId?: string
  data?: any
}

export interface JobResult {
  success: boolean
  message?: string
  data?: any
}

// Create queues
export const documentQueue = new Queue<JobData>('document-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export const ihaleQueue = new Queue<JobData>('ihale-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

export const notificationQueue = new Queue<JobData>('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
})

// Job processors
export async function setupQueueWorkers() {
  // Document alarm processor
  new Worker('document-processing', async (job) => {
    const { type, tenantId, data } = job.data
    
    try {
      switch (type) {
        case 'belge-alarm':
          await processDocumentAlarm(tenantId, data)
          break
        case 'kalici-silme':
          await processPermanentDelete(tenantId, data)
          break
        default:
          throw new Error(`Unknown document job type: ${type}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error(`Document job failed:`, error)
      throw error
    }
  }, {
    connection: redisConnection,
  })

  // İhale alarm processor
  new Worker('ihale-processing', async (job) => {
    const { type, tenantId, data } = job.data
    
    try {
      switch (type) {
        case 'ym-alarm':
          await processYMAlarm(tenantId, data)
          break
        case 'hukuki-alarm':
          await processHukukiAlarm(tenantId, data)
          break
        case 'sozlesme-alarm':
          await processSozlesmeAlarm(tenantId, data)
          break
        default:
          throw new Error(`Unknown ihale job type: ${type}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error(`İhale job failed:`, error)
      throw error
    }
  }, {
    connection: redisConnection,
  })

  // Hakediş processor
  new Worker('notifications', async (job) => {
    const { type, tenantId, data } = job.data
    
    try {
      switch (type) {
        case 'hakedis-acilis':
          await processHakedisAcilis(tenantId, data)
          break
        default:
          throw new Error(`Unknown notification job type: ${type}`)
      }
      
      return { success: true }
    } catch (error) {
      console.error(`Notification job failed:`, error)
      throw error
    }
  }, {
    connection: redisConnection,
  })
}

// Job processing functions (linked to queue-worker.ts)
async function processDocumentAlarm(tenantId: string, data: any) {
  await checkExpiringDocuments(tenantId)
}

async function processPermanentDelete(tenantId: string, data: any) {
  await deleteTrashDocuments(tenantId)
}

async function processYMAlarm(tenantId: string, data: any) {
  await checkYmAlarms(tenantId)
}

async function processHukukiAlarm(tenantId: string, data: any) {
  await checkLegalDeadlines(tenantId)
}

async function processSozlesmeAlarm(tenantId: string, data: any) {
  await checkSozlesmeAlarms(tenantId)
}

async function processHakedisAcilis(tenantId: string, data: any) {
  const year = typeof data?.year === 'number' ? data.year : undefined
  const month = typeof data?.month === 'number' ? data.month : undefined
  await checkHakedisAcilis(tenantId, { year, month })
}

// Helper functions to add jobs
export async function addDocumentAlarmJob(tenantId: string, data: any, delay = 0) {
  await documentQueue.add('belge-alarm', { type: 'belge-alarm', tenantId, data }, {
    delay,
    repeat: data.repeat ? { pattern: data.repeat } : undefined,
  })
}

export async function addYMAlarmJob(tenantId: string, data: any, delay = 0) {
  await ihaleQueue.add('ym-alarm', { type: 'ym-alarm', tenantId, data }, {
    delay,
    repeat: data.repeat ? { pattern: data.repeat } : undefined,
  })
}

export async function addHukukiAlarmJob(tenantId: string, data: any, delay = 0) {
  await ihaleQueue.add('hukuki-alarm', { type: 'hukuki-alarm', tenantId, data }, {
    delay,
    repeat: data.repeat ? { pattern: data.repeat } : undefined,
  })
}

export async function addSozlesmeAlarmJob(tenantId: string, data: any, delay = 0) {
  await ihaleQueue.add('sozlesme-alarm', { type: 'sozlesme-alarm', tenantId, data }, {
    delay,
    repeat: data.repeat ? { pattern: data.repeat } : undefined,
  })
}

export async function addHakedisAcilisJob(tenantId: string, data: any, delay = 0) {
  await notificationQueue.add('hakedis-acilis', { type: 'hakedis-acilis', tenantId, data }, {
    delay,
    repeat: data.repeat ? { pattern: data.repeat } : undefined,
  })
}

export async function addPermanentDeleteJob(tenantId: string, data: any, delay = 0) {
  await documentQueue.add('kalici-silme', { type: 'kalici-silme', tenantId, data }, {
    delay,
  })
}

// Queue management functions
export async function getQueueStats() {
  const [docStats, ihaleStats, notifStats] = await Promise.all([
    documentQueue.getJobCounts(),
    ihaleQueue.getJobCounts(),
    notificationQueue.getJobCounts(),
  ])

  return {
    document: docStats,
    ihale: ihaleStats,
    notification: notifStats,
  }
}

export async function pauseQueues() {
  await Promise.all([
    documentQueue.pause(),
    ihaleQueue.pause(),
    notificationQueue.pause(),
  ])
}

export async function resumeQueues() {
  await Promise.all([
    documentQueue.resume(),
    ihaleQueue.resume(),
    notificationQueue.resume(),
  ])
}

export async function clearQueues() {
  await Promise.all([
    documentQueue.drain(),
    ihaleQueue.drain(),
    notificationQueue.drain(),
  ])
}
