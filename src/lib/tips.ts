import { getDayOfYear, isWithinInterval, setMonth, setDate } from 'date-fns';

export const PRUDENCE_TIPS = [
  "Save at least 20% of your income every month.",
  "Always have an emergency fund for 3-6 months of expenses.",
  "Avoid impulse purchases by waiting 24 hours before buying.",
  "Track every penny; awareness is the first step to wealth.",
  "Invest in your education; it pays the best interest.",
  "Live below your means to build your future faster.",
  "Automate your savings so you don't have to think about it.",
  "Review your subscriptions monthly and cancel what you don't use.",
  "Buy quality items that last longer, even if they cost more upfront.",
  "Cook at home more often; it's healthier and cheaper.",
  "Set clear financial goals with specific deadlines.",
  "Pay off high-interest debt as quickly as possible.",
  "Understand the difference between a want and a need.",
  "Use cash for discretionary spending to stay on budget.",
  "Negotiate your bills and insurance rates annually.",
  "Build multiple streams of income for financial security.",
  "Don't try to keep up with the Joneses; they're likely in debt.",
  "Invest for the long term and ignore short-term market noise.",
  "Keep your housing costs below 30% of your take-home pay.",
  "Diversify your investments to manage risk.",
  "Start investing as early as possible to benefit from compound interest.",
  "Read at least one personal finance book every quarter.",
  "Discuss financial goals openly with your partner or family.",
  "Avoid using credit cards for things you can't afford to pay in cash.",
  "Take advantage of employer-sponsored retirement plans.",
  "Build a 'fun fund' so you can enjoy life without guilt.",
  "Shop with a list to avoid unnecessary purchases.",
  "Compare prices before making significant purchases.",
  "Maintain your belongings to avoid costly replacements.",
  "Learn the basics of taxes to optimize your filings.",
  "Avoid lifestyle inflation when you get a raise.",
  "Set up alerts for low balances and upcoming bills.",
  "Use a dedicated app like Prunance to stay organized.",
  "Celebrate small financial wins to stay motivated.",
  "Don't invest in things you don't understand.",
  "Keep your financial documents organized and accessible.",
  "Protect your identity and monitor your credit report.",
  "Have adequate insurance coverage for life's uncertainties.",
  "Think about the 'cost per use' before buying clothes or gadgets.",
  "Avoid payday loans and high-interest predatory lending.",
  "Teach your children about money from an early age.",
  "Give back; budgeting for charity can be very rewarding.",
  "Use library resources instead of buying every book or movie.",
  "Walk or bike for short trips to save on transport costs.",
  "Energy-efficient habits save money and the planet.",
  "Plan your meals for the week to reduce food waste.",
  "Buy generic brands for staples; they're often identical to name brands.",
  "Wait for sales for non-essential items.",
  "Avoid emotional spending; find other ways to cope with stress.",
  "Keep your car for as long as it's reliable and safe.",
  "Understand your net worth and track it over time.",
  "Set a 'no-spend' challenge for a weekend or a week.",
  "Review your bank statements for errors or hidden fees.",
  "Don't lend money to friends or family unless you're okay with not getting it back.",
  "Invest in assets that appreciate, not liabilities that depreciate.",
  "Your health is your greatest wealth; don't skimp on it.",
  "Avoid 'convenience' fees by planning ahead.",
  "Use rewards programs wisely, but don't spend just to get points.",
  "Keep a small buffer in your checking account to avoid overdrafts.",
  "Learn to say 'no' to social events that don't fit your budget.",
  "Focus on increasing your income as much as decreasing expenses.",
  "A budget is a permission to spend, not a restriction.",
  "Don't let a sale trick you into spending money you didn't plan to.",
  "Your future self will thank you for the sacrifices you make today.",
  "Financial freedom is the ability to live life on your terms.",
  "Compound interest is the eighth wonder of the world.",
  "The best time to start was yesterday; the second best time is now.",
  "Wealth is what you don't see: the cars not bought, the diamonds not worn.",
  "Money is a tool; learn how to use it, or it will use you.",
  "Small leaks sink great ships; watch your small recurring expenses.",
  "Don't put all your eggs in one basket.",
  "The goal is to be rich, not to look rich.",
  "Financial peace isn't the acquisition of stuff; it's learning to live on less.",
  "An investment in knowledge pays the best interest.",
  "Beware of little expenses; a small leak will sink a great ship.",
  "He who buys what he does not need, steals from himself.",
  "Never spend your money before you have earned it.",
  "Frugality includes all the other virtues.",
  "A penny saved is a penny earned.",
  "Annual income twenty pounds, annual expenditure nineteen nineteen and six, result happiness.",
  "The safe way to double your money is to fold it over once and put it in your pocket.",
  "Money often costs too much.",
  "It’s not how much money you make, but how much money you keep.",
  "The more you learn, the more you earn.",
  "Don't save what is left after spending; spend what is left after saving.",
  "Rich people stay rich by living like they are poor. Poor people stay poor by living like they are rich.",
  "If you buy things you do not need, soon you will have to sell things you need.",
  "A wise person should have money in their head, but not in their heart.",
  "Every time you borrow money, you're robbing your future self.",
  "Opportunity is missed by most people because it is dressed in overalls and looks like work.",
  "You must gain control over your money or the lack of it will forever control you.",
  "The habit of saving is itself an education; it fosters every virtue.",
  "Money is a terrible master but an excellent servant.",
  "Wealth consists not in having great possessions, but in having few wants.",
  "The quickest way to double your money is to fold it in half and put it back in your pocket.",
  "Balance your checkbook like your life depends on it.",
  "Your credit score is your financial reputation; protect it.",
  "Inflation is a hidden tax; invest to stay ahead of it.",
  "Emergency funds are for emergencies, not for 'great deals'.",
  "Financial independence is the ultimate goal."
];

export const NEW_YEAR_TIPS = [
  "New Year, New Goals: Review your financial plan for the year ahead.",
  "Start the year right by setting up your 12-month budget today.",
  "Reflect on last year's spending and identify areas for improvement.",
  "January is the perfect time to increase your retirement contributions.",
  "Set a major financial milestone for this year and break it down into steps.",
  "Clear out any holiday debt as your first priority this month.",
  "Fresh start: Organize your financial documents for the upcoming tax season."
];

export const YEAR_END_TIPS = [
  "Year-end review: How did you do against your financial goals?",
  "Max out your tax-advantaged accounts before the year ends.",
  "Plan your holiday spending now to avoid January stress.",
  "Consider charitable giving before December 31st for tax benefits.",
  "Review your investment portfolio and rebalance if necessary.",
  "Spend any remaining flexible spending account (FSA) funds.",
  "Prepare your financial resolutions for the coming year."
];

export function getTipOfTheDay(): string {
  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  
  // New Year Logic (Jan 1 - Jan 7)
  const isNewYear = isWithinInterval(now, {
    start: setDate(setMonth(now, 0), 1),
    end: setDate(setMonth(now, 0), 7)
  });
  
  if (isNewYear) {
    return NEW_YEAR_TIPS[dayOfYear % NEW_YEAR_TIPS.length];
  }
  
  // Year End Logic (Dec 24 - Dec 31)
  const isYearEnd = isWithinInterval(now, {
    start: setDate(setMonth(now, 11), 24),
    end: setDate(setMonth(now, 11), 31)
  });
  
  if (isYearEnd) {
    const dayOfDec = now.getDate(); // 24-31
    return YEAR_END_TIPS[(dayOfDec - 24) % YEAR_END_TIPS.length];
  }
  
  // Default: Deterministic tip from the 100 tips
  return PRUDENCE_TIPS[dayOfYear % PRUDENCE_TIPS.length];
}
