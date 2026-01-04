declare module '@speedchecker/react-native-plugin' {
  interface SpeedTestEvent {
    downloadSpeed?: string;
    uploadSpeed?: string;
    ping?: number;
    status?: string;
  }

  interface EventSubscription {
    remove: () => void;
  }

  interface SpeedCheckerPlugin {
    /**
     * Starts the speed test
     */
    startTest(): void;

    /**
     * Add listener for when the test starts
     * @param callback Function that receives the test started event
     * @returns Subscription object with remove() method for cleanup
     */
    addTestStartedListener(callback: (event: SpeedTestEvent) => void): EventSubscription;

    /**
     * Add listener for download progress updates
     * @param callback Function that receives download progress event
     * @returns Subscription object with remove() method for cleanup
     */
    addDownloadProgressListener(callback: (event: SpeedTestEvent) => void): EventSubscription;

    /**
     * Add listener for upload progress updates
     * @param callback Function that receives upload progress event
     * @returns Subscription object with remove() method for cleanup
     */
    addUploadProgressListener(callback: (event: SpeedTestEvent) => void): EventSubscription;

    /**
     * Add listener for ping updates
     * @param callback Function that receives ping event
     * @returns Subscription object with remove() method for cleanup
     */
    addPingListener(callback: (event: SpeedTestEvent) => void): EventSubscription;

    /**
     * Add listener for when the test finishes
     * @param callback Function that receives test finished event
     * @returns Subscription object with remove() method for cleanup
     */
    addTestFinishedListener(callback: (event: SpeedTestEvent) => void): EventSubscription;
  }

  const speedCheckerPlugin: SpeedCheckerPlugin;
  export default speedCheckerPlugin;
}
