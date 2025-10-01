import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from './useAnalytics';

export const useGlobalClickTracking = () => {
    const location = useLocation();
    const { trackClick, trackPageVisit } = useAnalytics({ autoTrack: false });

    const getElementIdentifier = useCallback((element: HTMLElement): string => {
        // Try to get the most meaningful identifier for the element
        const tagName = element.tagName.toLowerCase();
        
        // Check for common identifiers in order of preference
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;
        
        const title = element.getAttribute('title');
        if (title) return title;
        
        const dataTestId = element.getAttribute('data-testid');
        if (dataTestId) return dataTestId;
        
        // Check for text content for buttons and links
        if (tagName === 'button' || tagName === 'a') {
            const textContent = element.textContent?.trim();
            if (textContent && textContent.length < 50) {
                return textContent;
            }
        }
        
        // Check for icon names in Ant Design components
        const iconElement = element.querySelector('[class*="anticon"]');
        if (iconElement) {
            const iconClasses = Array.from(iconElement.classList)
                .find(cls => cls.includes('anticon-'));
            if (iconClasses) {
                const iconName = iconClasses.replace('anticon-', '');
                // Only use icon name if we have a meaningful context
                const parentText = element.textContent?.trim();
                if (parentText && parentText.length < 30) {
                    return `${parentText}-${iconName}`;
                }
                // Only use icon name for actual interactive elements
                if (element.tagName === 'BUTTON' || element.closest('button')) {
                    return `${iconName}-icon`;
                }
            }
        }
        
        // Check for specific component types and generate readable names
        if (element.closest('.ant-tabs-tab')) {
            const tabText = element.textContent?.trim();
            if (tabText) return `tab-${tabText}`;
        }
        
        if (element.closest('.ant-select')) {
            const selectText = element.textContent?.trim();
            if (selectText) return `select-${selectText}`;
        }
        
        if (element.closest('.ant-btn')) {
            const buttonText = element.textContent?.trim();
            if (buttonText) return `button-${buttonText}`;
        }
        
        if (element.closest('.ant-menu-item')) {
            const menuText = element.textContent?.trim();
            if (menuText) return `menu-${menuText}`;
        }
        
        if (element.closest('.ant-pagination-item')) {
            const pageText = element.textContent?.trim();
            if (pageText) return `page-${pageText}`;
        }
        
        if (element.closest('.ant-table-row')) {
            return 'table-row';
        }
        
        if (element.closest('.ant-card')) {
            const cardTitle = element.closest('.ant-card')?.querySelector('.ant-card-head-title')?.textContent?.trim();
            if (cardTitle) return `card-${cardTitle}`;
            return 'card';
        }
        
        // Check for parent context to provide more meaningful names
        const parent = element.parentElement;
        if (parent && parent !== document.body) {
            const parentId = parent.getAttribute('id');
            if (parentId) return `${tagName}-in-${parentId}`;
            
            const parentClass = parent.className;
            if (parentClass) {
                const meaningfulClasses = parentClass
                    .split(' ')
                    .filter(cls => 
                        cls && 
                        !cls.startsWith('ant-') && 
                        !cls.startsWith('css-') && 
                        !cls.startsWith('sc-') &&
                        cls.length > 2
                    )
                    .slice(0, 1);
                if (meaningfulClasses.length > 0) {
                    return `${meaningfulClasses[0]}-${tagName}`;
                }
            }
        }
        
        // Final fallback
        return `${tagName}-element`;
    }, []);

    const handleGlobalClick = useCallback((event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target) return;

        // Skip clicks on body, html, or document
        if (target === document.body || target === document.documentElement) {
            return;
        }

        // Skip clicks on layout containers and non-interactive elements
        const isLayoutElement = target.tagName === 'DIV' && 
                               (target.className.includes('layout') || 
                                target.className.includes('container') ||
                                target.className.includes('wrapper') ||
                                target.className.includes('content') ||
                                target.className.includes('main'));
        
        if (isLayoutElement && !target.onclick && target.style.cursor !== 'pointer') {
            return;
        }

        // Skip if the element or its parent has specific tracking
        // This prevents duplicate tracking when we have specific tracking
        const hasSpecificTracking = target.closest('[data-tracked="true"]');
        if (hasSpecificTracking) {
            return;
        }

        // Only track clicks on truly interactive elements
        const interactiveSelectors = [
            'button',
            'a[href]',
            'input[type="button"]',
            'input[type="submit"]',
            'input[type="reset"]',
            '[role="button"]',
            '[role="tab"]',
            '[role="menuitem"]',
            '[role="option"]',
            '[data-testid]',
            '.ant-btn',
            '.ant-tabs-tab',
            '.ant-menu-item',
            '.ant-dropdown-menu-item',
            '.ant-select-item',
            '.ant-checkbox',
            '.ant-radio',
            '.ant-switch',
            '.ant-slider',
            '.ant-rate',
            '.ant-pagination-item',
            '.ant-pagination-prev',
            '.ant-pagination-next',
            '.ant-collapse-header',
            '.ant-tree-node',
            '.ant-tree-switcher',
            '.ant-cascader-menu-item',
            '.ant-transfer-list-item',
            '.ant-timeline-item',
            '.ant-steps-item',
            '.ant-anchor-link',
            '.ant-breadcrumb-link',
            '.ant-tag',
            '.ant-badge',
            '.ant-avatar',
            '.ant-progress',
            '.ant-alert',
            '.ant-message',
            '.ant-notification',
            '.ant-modal',
            '.ant-drawer',
            '.ant-popover',
            '.ant-tooltip',
            '.ant-affix',
            '.ant-back-top'
        ];

        // Check if the clicked element or any of its parents matches our selectors
        let isInteractive = false;
        let currentElement: HTMLElement | null = target;
        
        while (currentElement && currentElement !== document.body) {
            // Check if current element matches any interactive selector
            for (const selector of interactiveSelectors) {
                if (currentElement.matches(selector)) {
                    // Additional check: ensure it's actually clickable
                    const isClickable = currentElement.tagName === 'BUTTON' || 
                                       currentElement.tagName === 'A' ||
                                       currentElement.getAttribute('role') === 'button' ||
                                       currentElement.getAttribute('role') === 'tab' ||
                                       currentElement.getAttribute('role') === 'menuitem' ||
                                       currentElement.getAttribute('role') === 'option' ||
                                       currentElement.closest('button') ||
                                       currentElement.closest('a[href]') ||
                                       currentElement.onclick ||
                                       currentElement.style.cursor === 'pointer';
                    
                    if (isClickable) {
                        isInteractive = true;
                        break;
                    }
                }
            }
            
            if (isInteractive) break;
            currentElement = currentElement.parentElement;
        }

        if (isInteractive) {
            const identifier = getElementIdentifier(target);
            trackClick(identifier);
        }
    }, [trackClick, getElementIdentifier]);

    useEffect(() => {
        // Add global click listener
        document.addEventListener('click', handleGlobalClick, true);
        
        return () => {
            document.removeEventListener('click', handleGlobalClick, true);
        };
    }, [handleGlobalClick]);

    // Track page visits when location changes
    useEffect(() => {
        trackPageVisit();
    }, [location.pathname, trackPageVisit]);
}; 