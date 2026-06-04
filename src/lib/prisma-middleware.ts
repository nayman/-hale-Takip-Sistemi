import { prismaClient } from './prisma-client'
import { auth } from './auth'

// Modern Prisma Extension for tenant isolation
// Note: Calling auth() in every query can be expensive and cause recursion.
// This is a basic implementation of the requirement.
export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Skip tenant filter for core models that are not tenant-specific
        if (
          model === 'Tenant' || 
          model === 'Account' || 
          model === 'Session' || 
          model === 'VerificationToken' ||
          model === 'SozlesmeKesinTeminat' ||
          model === 'SozlesmeBelge' ||
          model === 'IhaleGeciciTeminat' ||
          model === 'IhaleAtama' ||
          model === 'IhaleRakip' ||
          model === 'IhaleNot' ||
          model === 'IhaleItiraz' ||
          model === 'IhaleItirazBelge' ||
          model === 'KurumHafizaNot' ||
          model === 'KurumKisi'
        ) {
          return query(args)
        }

        const session = await auth()
        const tenantId = session?.user?.tenantId

        // Apply isolation only if tenantId is available in session
        if (tenantId) {
          // Add tenantId to where clause for read/update/delete
          if ('where' in args) {
            args.where = { ...args.where, tenantId } as any
          }
          
          // Add tenantId to data for create
          if (operation === 'create') {
            args.data = { ...args.data, tenantId } as any
          }

          if (operation === 'createMany') {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({ ...item, tenantId })) as any
            } else {
              args.data = { ...args.data, tenantId } as any
            }
          }
        }

        return query(args)
      },
    },
  },
})
