const fs = require('fs');

const file = 'src/components/NewsFeed.tsx';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('useTranslation')) {
    code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { useTranslation } from 'react-i18next';\nimport { motion, AnimatePresence } from 'framer-motion';");
    code = code.replace("export function NewsFeed() {", "export function NewsFeed() {\n  const { t } = useTranslation();");
    
    code = code.replace("'Error'", "t('Error')");
    code = code.replace("'Failed to like post'", "t('Failed to like post')");
    code = code.replace("'Retweet removed'", "t('Retweet removed')");
    code = code.replace("'Retweeted!'", "t('Retweeted!')");
    code = code.replace("'Failed to retweet'", "t('Failed to retweet')");
    code = code.replace("'Comments'", "t('Comments')");
    code = code.replace("'Comments are now available!'", "t('Comments are now available!')");
    code = code.replace("`Post by ${post.userName}`", "`${t('Post by')} ${post.userName}`");
    code = code.replace("`Shared via TruNorth`", "t('Shared via TruNorth')");
    code = code.replace("'Copied to clipboard'", "t('Copied to clipboard')");
    
    code = code.replace(">No posts yet<", ">{t('No posts yet')}<");
    code = code.replace(">Be the first to share something!<", ">{t('Be the first to share something!')}<");
    code = code.replace("|| 'Anonymous'", "|| t('Anonymous')");
    code = code.replace("alt=\"Post\"", "alt={t('Post')}");
    code = code.replace(">Show more<", ">{t('Show more')}<");
    
    fs.writeFileSync(file, code);
    console.log("Fixed NewsFeed.tsx");
}

const postcardFile = 'src/components/PostCard.tsx';
if (fs.existsSync(postcardFile)) {
    let code2 = fs.readFileSync(postcardFile, 'utf8');
    if (!code2.includes('useTranslation')) {
        code2 = code2.replace("import { Heart, MessageCircle, MoreHorizontal, Repeat2, Share2 } from 'lucide-react';", "import { useTranslation } from 'react-i18next';\nimport { Heart, MessageCircle, MoreHorizontal, Repeat2, Share2 } from 'lucide-react';");
        code2 = code2.replace("export function PostCard({ post }: PostCardProps) {", "export function PostCard({ post }: PostCardProps) {\n  const { t } = useTranslation();");
        
        code2 = code2.replace("'You'", "t('You')");
        code2 = code2.replace("'Write a comment...'", "t('Write a comment...')");
        code2 = code2.replace(">Post<", ">{t('Post')}<");
        code2 = code2.replace("`Post by ${post.userName}`", "`${t('Post by')} ${post.userName}`");
        code2 = code2.replace("`Shared via TruNorth`", "t('Shared via TruNorth')");
        
        fs.writeFileSync(postcardFile, code2);
        console.log("Fixed PostCard.tsx");
    }
}
