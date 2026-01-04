import { useUserTier } from '../lib/UserTierContext';

export const useFeatureAccess = () => {
    const { isPremium } = useUserTier();

    const FREE_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB

    return {
        isPremium,
        canExportExcel: isPremium,
        canBatchProcess: isPremium,
        checkFileSize: (size: number) => {
            if (isPremium) return true;
            return size <= FREE_FILE_SIZE_LIMIT;
        },
        limits: {
            fileSize: FREE_FILE_SIZE_LIMIT,
        }
    };
};
